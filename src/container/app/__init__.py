from fastapi import FastAPI

import os
import requests

app = FastAPI()

if not (lambda_endpoint := os.environ.get("TARGET_URL")):
    raise Exception("The required 'TARGET_URL' is not defined")

@app.get("/")
async def root():
    return requests.get(lambda_endpoint).json()
