from fastapi import FastAPI

import boto3
import os

app = FastAPI()

if not (queue_url := os.environ.get("TARGET_QUEUE_URL")):
    raise Exception("The required 'TARGET_URL' is not defined")

@app.get("/")
async def root():
    client = boto3.client('sqs')

    return client.send_message(
        QueueUrl=queue_url,
        MessageBody=f"Hello from Boto3"
    )
