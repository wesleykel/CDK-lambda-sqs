import { Handler, Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { IQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { NODATA } from "dns";
import { NodeRuntime } from "inspector";
import { boolean, string } from "zod";
import { handler } from "../../src/handler";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
export interface ExampleConstructProps extends NodejsFunctionProps {
  isTriggerQue: boolean;
}

export class ExtendedLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: ExampleConstructProps) {
    const lambaProps: ExampleConstructProps = {
      isTriggerQue: false,
      entry: props.entry,
      handler: props.handler,
      logRetention: RetentionDays.ONE_WEEK,
      runtime: Runtime.NODEJS_20_X,
    };

    super(scope, id, lambaProps);

    if (props.isTriggerQue) {
      const dlk = new Queue(this, "dlk");
      const que = new Queue(this, "que", {
        deadLetterQueue: {
          queue: dlk,
          maxReceiveCount: 1,
        },
      });

      que.grantSendMessages(this);
    }
  }
}
