import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class MyLumigoTokenSecretStack extends Stack {
  constructor(scope: Construct, id: string, value: string, props: StackProps = {}) {
    super(scope, id, props);

    new secretsmanager.Secret(this, id, {
      secretName: id,
      secretStringValue: SecretValue.unsafePlainText(value),
    });
  }
}