import { Callback, Context } from "aws-lambda";
import { DocumentClient, UpdateItemInput } from "aws-sdk/clients/dynamodb";
import axios from "axios";
import { DiscordEventRequest, DiscordResponseData } from "discord-bot-cdk-construct";
import { getDiscordSecrets } from "discord-bot-cdk-construct/dist/functions/utils/DiscordSecrets";

const TABLE_NAME = process.env.TABLE_NAME || "";

const storeTranslations = {
  mmat: "Media Markt Austria",
  mmde: "Media Markt Germany",
  saturn: "Saturn",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handler(event: DiscordEventRequest, _: Context, __: Callback): Promise<string> {
  const response: DiscordResponseData = {
    tts: false,
    content: "Do you control the cookie or does the cookie control you? (Invalid request)",
    embeds: [],
    allowed_mentions: [],
  };
  if (event?.jsonBody?.token) {
    const store = event.jsonBody.data?.options?.find((option) => option?.name === "store")?.value as keyof typeof storeTranslations;
    const productId = event.jsonBody.data?.options?.find((option) => option?.name === "product_id")?.value;
    if (store && productId) {
      const db = new DocumentClient();
      const params = {
        TableName: TABLE_NAME,
        Key: {
          store,
          productId,
        },
        UpdateExpression: "REMOVE cookies[0]",
        ReturnValues: "ALL_OLD",
      } as UpdateItemInput;
      const dbResponse = await db.update(params).promise();
      if (dbResponse.Attributes?.cookies?.length) {
        response.content = `🍪 You requested a cookie for \`${dbResponse.Attributes.title}\`, \`${productId}\` at \`${storeTranslations[store]}\`, so here it is: \n${dbResponse.Attributes.cookies[0]}`;
      } else {
        response.content = `📭 You requested a cookie for \`${productId}\` at \`${storeTranslations[store]}\`, but I'm out of 🍪. Nom nom nom.`;
      }
    }
    await sendResponse(response, event.jsonBody.token);
    console.log("Responded successfully!");
  } else {
    console.log("Failed to send response!");
  }
  return "200";
}

async function sendResponse(response: DiscordResponseData, interactionToken: string): Promise<boolean> {
  const discordSecret = await getDiscordSecrets();
  const authConfig = {
    headers: {
      Authorization: `Bot ${discordSecret?.authToken}`,
    },
  };

  try {
    const url = `https://discord.com/api/v8/webhooks/${discordSecret?.clientId}/${interactionToken}`;
    return (await axios.post(url, response, authConfig)).status == 200;
  } catch (exception) {
    console.log(`There was an error posting a response: ${exception}`);
    return false;
  }
}
