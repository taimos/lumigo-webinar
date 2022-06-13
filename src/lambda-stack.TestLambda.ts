export async function handler(event: AWSLambda.APIGatewayProxyEvent): Promise<AWSLambda.APIGatewayProxyResult> {
  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({ foo: 'bar' }),
  };
}