import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { userSchema } from "../zod-schema/zod";

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
  const payload = JSON.parse(event.body ?? "{}");
  const client = new SQSClient({ region: "us-east-1" });

  let userData = userSchema.safeParse(payload);

  const input = {
    MessageBody: JSON.stringify(payload),
    QueueUrl: process.env.QUEUE_URL,
  };

  if (userData.success) {
    const command = new SendMessageCommand(input);
    const response = await client.send(command);
    console.log("Success");
    return {
      statusCode: 200,
      body: "data received",
    };
  }
  if (userData.error) {
    return {
      statusCode: 400,
      body: userData.error.toString(),
    };
  }
  return { statusCode: 500, body: "Error" };
};
