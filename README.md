# Cookie Monster

> This serverless Discord Bot built using [GEMISIS/discord-bot-cdk-construct](https://github.com/GEMISIS/discord-bot-cdk-construct) serves you stored cart cookies for MediaMarkt and Saturn from a DynamoDB.

## Supported stores

- MediaMarkt Austria
- MediaMarkt Germany
- MediaMarkt Spain
- Saturn

# Installation/Deployment

Clone repository, setup the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with.html#work-with-prerequisites).  
You can restrict access to specific user roles, by setting the `USER_ROLE` environment variable.
Configure the DynamoDB ARN by setting it as an environment variable `COOKIE_ARN`, for example:

```sh
export COOKIE_ARN="arn:aws:dynamodb:eu-central-1:9999999:table/my-cookie-jar"
export USER_ROLE="12345678"
```

If you omit the ARN then the construct will create a new DynamoDB table for you

You need to create a [new Discord bot](https://discord.com/developers/applications) and register the [Slash command](https://discord.com/developers/docs/interactions/slash-commands#registering-a-command) (make sure to use the Bot token not the OAuth 2 token!). Ensure to configure two options: `store` and `productId` - or alter the code. 😉

To deploy the application, run `cdk deploy` (see below for more commands).

In the AWS Secrets Manager, modify the created secret (paste it as plain text JSON object):

```json5
{
  appId: "XXXXX",
  publicKey: "XXXXX",
  clientId: "XXXXX", // OAuth 2 - can be the same as appId
  authToken: "XXXXX", // OAuth 2
}
```

Enter the CDK construct Lambda URL with the suffix `/event` as your interaction URL.  
Finally, configure the OAuth 2 scope (`bot` and `applications.commands`) and use the URL to add the bot to your server.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

---

Built by (c) Tim Brust and contributors. Released under the GPL v3 license.
