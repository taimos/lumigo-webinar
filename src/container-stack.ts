import * as path from 'path';

import { Stack, StackProps } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { DockerImageName, ECRDeployment } from 'cdk-ecr-deployment';
import { Construct } from 'constructs';

export class MyContainerStack extends Stack {
  constructor(scope: Construct, id: string, lumigoTokenSecret: Secret, lambdaApi: RestApi, props: StackProps = {}) {
    super(scope, id, props);

    // Ensure ECR repository for App image exists
    const appImageRepository = Repository.fromRepositoryName(this, 'lumigo-demo-container-app', 'lumigo-demo-container-app') ||
      new Repository(this, 'LumigoDemoContainerApp', {
        repositoryName: 'lumigo-demo-container-app',
      });

    // Build the App image against the local Docker daemon
    const containerAppImage = new DockerImageAsset(this, 'LumigoDemoContainerAppImage', {
      directory: path.join(__dirname, 'container'),
      platform: Platform.LINUX_AMD64, // Ensure we build for x86 even when running CDK from a new Mac :-)
    });

    // Push the locally-built App image to the ECR repository
    new ECRDeployment(this, 'DeployLumigoDemoContainerAppImage', {
      src: new DockerImageName(containerAppImage.imageUri),
      dest: new DockerImageName(`${appImageRepository.repositoryUri}:latest`),
    });

    const vpc = new Vpc(this, 'LumigoDemoVpc', {
      vpcName: 'LumigoDemoVpc',
      cidr: '10.0.0.0/16',
      maxAzs: 3, // Default is all AZs in region
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'private-subnet',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: 'public-subnet',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    const cluster = new ecs.Cluster(this, 'LumigoDemoCluster', {
      vpc: vpc,
    });

    const lumigoEndpoint = process.env.LUMIGO_ENDPOINT ? `${String(process.env.LUMIGO_ENDPOINT)}/v1/traces` : ''; // This will not be needed after public launch :-)

    // Instantiate a 1-container Fargate task with a public load balancer
    new ApplicationLoadBalancedFargateService(this, 'LumigoDemoFargateService', {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      // desiredCount: 6, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(appImageRepository),
        environment: {
          AUTOWRAPT_BOOTSTRAP: 'lumigo_opentelemetry', // Activate the Lumigo instrumentation!
          LUMIGO_ENDPOINT: lumigoEndpoint,
          TARGET_URL: lambdaApi.url!,
          OTEL_SERVICE_NAME: 'lumigo-container-demo', // This will be the service name in Lumigo
        },
        secrets: {
          LUMIGO_TRACER_TOKEN: ecs.Secret.fromSecretsManager(lumigoTokenSecret),
        },
      },
      memoryLimitMiB: 1024, // Default is 512, the correct value is related with the CPU's, see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-cpu-memory-error.html
      publicLoadBalancer: true, // Default is false
    });
  }
}