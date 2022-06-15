import { join } from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface ContainerStackProps extends StackProps {
  readonly lumigoEndpoint: URL;
  readonly queue: IQueue;
}

export class MyContainerStack extends Stack {
  constructor(scope: Construct, id: string, props: ContainerStackProps) {
    super(scope, id, props);

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

    // Instantiate a 1-container Fargate task with a public load balancer
    const service = new ApplicationLoadBalancedFargateService(this, 'LumigoDemoFargateService', {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      // desiredCount: 6, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset(join(__dirname, 'container'), {
          platform: Platform.LINUX_AMD64, // Ensure we build for x86 even when running CDK from a new Mac :-)
        }),
        environment: {
          AUTOWRAPT_BOOTSTRAP: 'lumigo_opentelemetry', // Activate the Lumigo instrumentation!
          LUMIGO_ENDPOINT: props.lumigoEndpoint.toString(),
          TARGET_QUEUE_URL: props.queue.queueUrl!,
          OTEL_SERVICE_NAME: 'lumigo-container-demo', // This will be the service name in Lumigo
        },
        secrets: {
          LUMIGO_TRACER_TOKEN: ecs.Secret.fromSecretsManager(Secret.fromSecretNameV2(this, 'Secret', 'AccessKeys'), 'LumigoToken'),
        },
      },
      memoryLimitMiB: 1024, // Default is 512, the correct value is related with the CPU's, see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-cpu-memory-error.html
      publicLoadBalancer: true, // Default is false
    });

    // Allow the Fargate task to queue messages
    props.queue.grantSendMessages(service.taskDefinition.taskRole);
  }
}