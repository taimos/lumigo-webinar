import { App } from 'aws-cdk-lib';
// import { MyContainerStack } from './container-stack';
import { MyLambdaStack } from './lambda-stack';

const app = new App();

new MyLambdaStack(app, 'lumigo-webinar-lambda', {
  env: {
    account: '538118019757',
    region: 'eu-central-1',
  },
});
// new MyContainerStack(app, 'lumigo-webinar-container', {
//   env: {
//     account: '538118019757',
//     region: 'eu-central-1',
//   },
// });

app.synth();