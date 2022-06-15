import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class MyLambdaStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, lumigoTokenSecret: Secret, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'LumigoDemoVpc', {
      vpcName: 'LumigoDemoVpc',
      maxAzs: 3, // Default is all AZs in region
    });

    const handler = new NodejsFunction(this, 'TestLambda', {
      environment: {
        LUMIGO_TRACER_TOKEN: lumigoTokenSecret.secretValue.unsafeUnwrap(), // Pity we cannot mount secrets in the same way ECS can :-(
        LUMIGO_TRACER_HOST: String(process.env.LUMIGO_ENDPOINT) || '',
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/lumigo_wrapper',
      },
      layers: [
        LayerVersion.fromLayerVersionArn(this, 'LumigoLayer', 'arn:aws:lambda:eu-central-1:114300393969:layer:lumigo-node-tracer:189'),
      ],
      vpc: vpc,
    });

    this.api = new RestApi(this, id);
    this.api.root.addMethod('GET', new LambdaIntegration(handler));
  }
}