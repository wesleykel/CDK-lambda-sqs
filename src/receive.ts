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
    MaxNumberOfMessages: 1, //works with 1
    VisibilityTimeout: 1, // this works (but, obviously, at a cost 🙁 )
    WaitTimeSeconds: 5,
  });
  const response: ReceiveMessageCommandOutput = await sqsClient.send(command);

  //.Message;
  //delete message
  if (response.Messages) {
    // console.log(response.Messages[0].ReceiptHandle);
    console.log(response);
    response.Messages.forEach(async (message, index) => {
      const input = {
        QueueUrl: process.env.QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      };
      if (message.Body) {
        let newMessage = JSON.parse(message.Body);
        console.log(newMessage);
        try {
          const dbCommand = new PutItemCommand({
            TableName: process.env.DB, // required

            Item: {
              // Item to be written
              pk: { S: `${newMessage.firstName}` },
              sk: { S: `${newMessage.lastName}` },
              email: { S: `${newMessage.email}` },
              postCode: { S: `${newMessage.postCode}` },
            },
          });
          await dbClient.send(dbCommand);
          new DeleteMessageCommand(input);
        } catch (error) {
          console.error(error);
        }
      }
      console.log("item sent to db");
      console.log(`Deleting  message ${message.ReceiptHandle}`);
    });
  }
};
