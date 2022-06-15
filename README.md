# Lumigo Fargate + Lambda demo

## Setup

1. Have a Docker daemon running on your machine (CDK will need to build a Docker image and push it to Amazon ECR)
2. Create a `.env` file filling out the `.env.tmpl` template and renaming it to `.env`
3. Run `cdk deploy --all`