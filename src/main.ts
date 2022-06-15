import { App } from 'aws-cdk-lib';

import { MyContainerStack } from './container-stack';
import { MyLambdaStack } from './lambda-stack';

const app = new App();

// use fixed values when deploying this for a real project
const stackEnvironment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const lambdaStack = new MyLambdaStack(app, 'lumigo-webinar-lambda', {
  env: stackEnvironment,
});

new MyContainerStack(app, 'lumigo-webinar-container', {
  env: stackEnvironment,
  queue: lambdaStack.queue,
});

app.synth();