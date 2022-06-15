import { App } from 'aws-cdk-lib';
import 'dotenv/config';

import { MyContainerStack } from './container-stack';
import { MyLambdaStack } from './lambda-stack';
import { MyLumigoTokenSecretStack } from './lumigo-token-secret-stack';
import { MySqsStack } from './sqs-stack';

var path = require('path');
var dotenv = require('dotenv');

/*
 * Reads the following vars from `<repo_root>/.env` and sets them
 * on the process as environment variables:
 *
 * ```
 * ACCOUNT=538118019757
 * REGION=eu-central-1
 * LUMIGO_TRACER_TOKEN= ...
 * ```
 */
dotenv.config({ path: path.join(path.dirname(__dirname), '.env') });

const app = new App();

const stackEnvironment = {
  region: process.env.REGION,
  account: process.env.ACCOUNT,
};

const sqsStack = new MySqsStack(app, 'lumigo-sqs', {
  env: stackEnvironment,
});

const lumigoTokenSecretStack = new MyLumigoTokenSecretStack(app, 'lumigo-tracer-token', String(process.env.LUMIGO_TRACER_TOKEN), {
  env: stackEnvironment,
});

new MyLambdaStack(app, 'lumigo-webinar-lambda', lumigoTokenSecretStack.lumigoTokenSecret, sqsStack.queue, {
  env: stackEnvironment,
});

new MyContainerStack(app, 'lumigo-webinar-container', lumigoTokenSecretStack.lumigoTokenSecret, sqsStack.queue, {
  env: stackEnvironment,
});

app.synth();