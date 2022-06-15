import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class MyLambdaStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, lumigoTokenSecret: Secret, queue: Queue, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'LumigoDemoVpc', {
      vpcName: 'LumigoDemoVpc',
      maxAzs: 3, // Default is all AZs in region
    });

    const handler = new NodejsFunction(this, 'TestLambda', {
      environment: {
        LUMIGO_TRACER_TOKEN: lumigoTokenSecret.secretValue.unsafeUnwrap(), // Pity we cannot mount secrets in the same way ECS can :-(
        LUMIGO_TRACER_HOST: 'angels-edge-app-us-west-2.angels.golumigo.com',
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/lumigo_wrapper',
      },
      layers: [
        LayerVersion.fromLayerVersionArn(this, 'LumigoLayer', 'arn:aws:lambda:eu-central-1:114300393969:layer:lumigo-node-tracer:189'),
      ],
      vpc: vpc,
    });

    // 👇 add sqs queue as event source for lambda
    handler.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
      }),
    );

    this.api = new RestApi(this, id);
    this.api.root.addMethod('GET', new LambdaIntegration(handler));
  }
}