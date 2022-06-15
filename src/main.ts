import { URL } from 'node:url';
import { App } from 'aws-cdk-lib';

import { MyContainerStack } from './container-stack';
import { MyLambdaStack } from './lambda-stack';

const app = new App();

// use fixed values when deploying this for a real project
const stackEnvironment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const lumigoEndpoint = new URL('https://angels-edge-app-us-west-2.angels.golumigo.com');

const lambdaStack = new MyLambdaStack(app, 'lumigo-webinar-lambda', {
  env: stackEnvironment,
  lumigoEndpoint: lumigoEndpoint,
});

new MyContainerStack(app, 'lumigo-webinar-container', {
  env: stackEnvironment,
  queue: lambdaStack.queue,
  lumigoEndpoint: new URL('v1/traces', lumigoEndpoint.toString()),
});

app.synth();