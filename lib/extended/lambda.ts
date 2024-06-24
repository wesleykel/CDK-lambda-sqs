import { Handler, Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { IQueue, Queue, DeadLetterQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { NODATA } from "dns";
import { NodeRuntime } from "inspector";
import { boolean, lazy, string } from "zod";
import { handler } from "../../src/handler";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Lazy } from "aws-cdk-lib";
export interface ExampleConstructProps extends NodejsFunctionProps {
  isTriggerQue: boolean;
}

export class ExtendedLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: ExampleConstructProps) {
    const getQue = (id: number): DeadLetterQueue => {
      if (props.isTriggerQue) {
        const dlk123 = new Queue(scope, `dlx${id}`);
        const que: DeadLetterQueue = {
          queue: dlk123,
          maxReceiveCount: 1,
        };
        return que;
      } else {
        const dlk = new Queue(scope, `default`);
        const defaultQueue: DeadLetterQueue = {
          queue: dlk,
          maxReceiveCount: 1,
        };
        return defaultQueue;
      }
    };
    const { queue } = getQue(1234);
    const lambaProps: ExampleConstructProps = {
      isTriggerQue: false,
      entry: props.entry,
      handler: props.handler,
      logRetention: RetentionDays.ONE_WEEK,
      runtime: Runtime.NODEJS_20_X,

      deadLetterQueue: queue,
    };

    super(scope, id, lambaProps);
    lambaProps.deadLetterQueue?.grantSendMessages(this);
  }
}
