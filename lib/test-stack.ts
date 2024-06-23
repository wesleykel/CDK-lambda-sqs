import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

import { ExtendedLambda } from "./extended/lambda";

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ExtendedLambda(this, "ex-lambda", {
      isTriggerQue: true,

      handler: "handler",
      entry: path.join(__dirname, "../src/handler.ts"),
    });
  }
}
