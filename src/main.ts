import { App } from 'aws-cdk-lib';
import 'dotenv/config'

import { MyLumigoTokenSecretStack } from './lumigo-token-secret-stack';
// import { MyContainerStack } from './container-stack';
import { MyLambdaStack } from './lambda-stack';

var path = require('path');
var dotenv = require('dotenv');

/*
 * Reads the following vars from `<repo_root>/.env` and sets them
 * on the process as environment variables:
 *
 * ```
 * ACCOUNT=538118019757
 * REGION=eu-central-1
 * LUMIGO_ENDPOINT= ... // To use with Lumigo dev envs
 * LUMIGO_TRACER_TOKEN= ...
 * ```
 */
dotenv.config({ path: path.join(path.dirname(__dirname), '.env') });

const app = new App();

new MyLumigoTokenSecretStack(app, 'lumigo-tracer-token', String(process.env.LUMIGO_TRACER_TOKEN), {
  env: {
    region: process.env.REGION,
    account: process.env.ACCOUNT,
  },
});

new MyLambdaStack(app, 'lumigo-webinar-lambda', 'lumigo-tracer-token', {
  env: {
    region: process.env.REGION,
    account: process.env.ACCOUNT,
  },
});

// new MyContainerStack(app, 'lumigo-webinar-container', {
//   env: {
//     region: process.env.REGION,
//     account: process.env.ACCOUNT,
//   },
// });

app.synth();