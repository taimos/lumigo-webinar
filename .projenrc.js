const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.27.0',
  defaultReleaseBranch: 'main',
  name: 'lumigo-webinar',
  deps: [],
  devDeps: ['@types/aws-lambda'],
});
project.synth();