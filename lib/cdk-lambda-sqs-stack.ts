import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");
//import  handler from "./src/handler"
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class CdkLambdaSqsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "userInputQueue", {
      //contentBasedDeduplication: true,
    });

    const fn = new NodejsFunction(this, "Lambda", {
      runtime: Runtime.NODEJS_20_X,

      entry: path.join(__dirname, "../src/handler.ts"),
      handler: "handler",
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
    });
    const fn2 = new NodejsFunction(this, "Lambda2", {
      runtime: Runtime.NODEJS_20_X,

      entry: path.join(__dirname, "../src/handler.ts"),
      handler: "handler",
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
    });

    const api = new cdk.aws_apigateway.LambdaRestApi(this, "userInput", {
      handler: fn,
      proxy: false,
    });

    const userRoute = api.root.addResource("user");
    userRoute.addMethod("POST");

    queue.grantSendMessages(fn);

    const receivingLambda = new NodejsFunction(this, "Receiving Lambda", {
      runtime: Runtime.NODEJS_20_X,

      entry: path.join(__dirname, "../src/receive.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(25),
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
    });
    queue.grantConsumeMessages(receivingLambda);

    const eventSource = new SqsEventSource(queue);

    receivingLambda.addEventSource(eventSource);
  }
}
