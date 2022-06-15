import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class MyLumigoTokenSecretStack extends Stack {

  public readonly lumigoTokenSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, value: string, props: StackProps = {}) {
    super(scope, id, props);

    this.lumigoTokenSecret = new secretsmanager.Secret(this, id, {
      secretName: id,
      secretStringValue: SecretValue.unsafePlainText(value),
    });
  }
}