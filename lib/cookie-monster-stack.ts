import { LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { AttributeType, ITable, Table } from "@aws-cdk/aws-dynamodb";
import { Runtime } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Construct, Duration, Stack, StackProps } from "@aws-cdk/core";
import { DiscordBotConstruct } from "discord-bot-cdk-construct";
import { join } from "path";

export class CookieMonsterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    let table: ITable;
    if (process.env.COOKIE_ARN) {
      table = Table.fromTableArn(this, "cookie-jar", process.env.COOKIE_ARN);
    } else {
      table = new Table(this, "cookie-jar", {
        partitionKey: {
          name: "store",
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "productId",
          type: AttributeType.STRING,
        },
        tableName: "mms-cookie-jar",
      });
    }

    const handler = new NodejsFunction(this, "cookie-retriever", {
      runtime: Runtime.NODEJS_14_X,
      entry: join(__dirname, "./functions/cookie-retriever.ts"),
      handler: "handler",
      timeout: Duration.seconds(3),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(handler);

    new DiscordBotConstruct(this, "bot-construct", {
      commandsLambdaFunction: handler,
    });

    const api = new RestApi(this, "cookie-retriever-api", {
      restApiName: "Cookie Retriever Service",
      description: "This service serves the cookie retriever",
    });

    const getCookieRetrieverIntegeration = new LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });

    api.root.addMethod("GET", getCookieRetrieverIntegeration);
  }
}
