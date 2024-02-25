import {
  SQSClient,
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
//import { input as dynamoInput } from "../dynamoSchema/tableSchema";
export const handler = async (): Promise<void> => {
  const sqsClient = new SQSClient({ region: "us-east-1" });
  const dbClient = new DynamoDBClient({ region: "us-east-1" });

  const command = new ReceiveMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    AttributeNames: ["All"],
    MessageAttributeNames: ["firstName", "lastName"],
    MaxNumberOfMessages: 5, //works with 1
    VisibilityTimeout: 1, // this works (but, obviously, at a cost 🙁 )
    WaitTimeSeconds: 20,
  });
  const response: ReceiveMessageCommandOutput = await sqsClient.send(command);

  console.log(response); //.Message;
  //delete message
  if (response.Messages) {
    // console.log(response.Messages[0].ReceiptHandle);

    response.Messages.forEach(async (message) => {
      const input = {
        QueueUrl: process.env.QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      };
      try {
        const dbCommand = new PutItemCommand({
          TableName: process.env.DB, // required

          Item: {
            // Item to be written
            pk: { S: `${message.MessageId}` },
          },
        });
        await dbClient.send(dbCommand);
        new DeleteMessageCommand(input);
      } catch (error) {
        console.error(error);
      }

      console.log("item sent to db");
      console.log(`Deleting  message ${message.ReceiptHandle}`);
    });
  }
};
