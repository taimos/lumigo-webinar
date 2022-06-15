import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class MyLambdaStack extends Stack {
  constructor(scope: Construct, id: string, lumigoTokenSecretName: string, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'LumigoDemoVpc', {
      vpcName: 'LumigoDemoVpc',
      maxAzs: 3, // Default is all AZs in region
    });

    const handler = new NodejsFunction(this, 'TestLambda', {
      environment: {
        LUMIGO_TRACER_TOKEN: SecretValue.secretsManager(lumigoTokenSecretName).toString(),
        LUMIGO_ENDPOINT: String(process.env.LUMIGO_ENDPOINT),
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/lumigo_wrapper',
      },
      layers: [
        LayerVersion.fromLayerVersionArn(this, 'LumigoLayer', 'arn:aws:lambda:eu-central-1:114300393969:layer:lumigo-node-tracer:189'),
      ],
      vpc: vpc,
    });

    const api = new RestApi(this, 'Api');
    api.root.addMethod('GET', new LambdaIntegration(handler));
  }
}