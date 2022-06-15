import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface LambdaStackProps extends StackProps {
  readonly lumigoEndpoint: URL;
}

export class MyLambdaStack extends Stack {
  public readonly api: RestApi;
  public readonly queue: Queue;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.queue = new Queue(this, 'LumigoDemoQueue', {
      encryption: QueueEncryption.KMS_MANAGED,
    });

    const handler = new NodejsFunction(this, 'TestLambda', {
      environment: {
        LUMIGO_TRACER_TOKEN: SecretValue.secretsManager('AccessKeys', { jsonField: 'LumigoToken' }).toString(), // Pity we cannot mount secrets in the same way ECS can :-(
        LUMIGO_TRACER_HOST: props.lumigoEndpoint.hostname,
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/lumigo_wrapper',
      },
      layers: [
        LayerVersion.fromLayerVersionArn(this, 'LumigoLayer', 'arn:aws:lambda:eu-central-1:114300393969:layer:lumigo-node-tracer:189'),
      ],
    });

    // 👇 add sqs queue as event source for lambda
    handler.addEventSource(
      new SqsEventSource(this.queue, {
        batchSize: 10,
      }),
    );

    this.api = new RestApi(this, id);
    this.api.root.addMethod('GET', new LambdaIntegration(handler));
  }
}