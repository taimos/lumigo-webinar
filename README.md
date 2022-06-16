# Lumigo Fargate + Lambda demo

## Setup

1. Create a secret in AWS SecretManager with  name `AccessKeys` and `LumigoToken` as field, using as value for the latter the Lumigo token you find in the Lumigo platform under `Settings --> Tracing --> Manual tracing`
1. Have a Docker daemon running on your machine (CDK will need to build a Docker image and push it to Amazon ECR)
1. Run `cdk deploy --all`
