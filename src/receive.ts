import {
  SQSClient,
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { User, userSchema } from "../zod-schema/zod";

export const handler = async (): Promise<void> => {
  const client = new SQSClient();

  const command = new ReceiveMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    AttributeNames: ["All"],
    MessageAttributeNames: ["firstName", "lastName"],
    MaxNumberOfMessages: 5, //works with 1
    VisibilityTimeout: 1, // this works (but, obviously, at a cost 🙁 )
    WaitTimeSeconds: 20,
  });
  const response: ReceiveMessageCommandOutput = await client.send(command);

  console.log(response.Messages);

  if (response.Messages) {
    console.log(response.Messages[0].ReceiptHandle);
    const input = {
      QueueUrl: process.env.QUEUE_URL,
      ReceiptHandle: response.Messages[0].ReceiptHandle,
    };
    const deleteMessage = new DeleteMessageCommand(input);
  }
};
