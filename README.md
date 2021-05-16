# Cookie Monster

> This serverless Discord Bot built using [GEMISIS/discord-bot-cdk-construct](https://github.com/GEMISIS/discord-bot-cdk-construct) serves you stored cart cookies for MediaMarkt and Saturn from a DynamoDB.

## Supported stores

- Saturn
- MediaMarkt Germany
- MediaMarkt Austria

# Installation/Deployment

Clone repository, setup the AWS CDK.  
Configure the DynamoDB ARN by setting it as an enviornment variable `COOKIE_ARN`, for example:

```sh
export COOKIE_ARN="arn:aws:dynamodb:eu-central-1:9999999:table/my-cookie-jar"
```

You need to create a new Discord bot, register the [Slash command](https://discord.com/developers/docs/interactions/slash-commands#registering-a-command)

In the AWS Secrets Manager, modify the corresponding secret (JSON value):

```json
{
  "appId": "XXXXX",
  "publicKey": "XXXXX",
  "clientId": "XXXXX",
  "authToken": "XXXXX",
  "serverId": "XXXXX"
}
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
