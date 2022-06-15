
import { Stack, StackProps } from 'aws-cdk-lib';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class MySqsStack extends Stack {
  public readonly queue: Queue;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    this.queue = new Queue(this, 'LumigoDemoQueue', {
      encryption: QueueEncryption.KMS_MANAGED,
    });
  }
}