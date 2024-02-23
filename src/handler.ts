import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { User, userSchema } from "../zod-schema/zod";

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult> => {
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
    return {
      statusCode: 200,
      body: "data received",
    };
  }

  return {
    statusCode: 500,
    body: userData.error.toString(),
  };
};
