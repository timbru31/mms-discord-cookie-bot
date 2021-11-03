import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import axios from "axios";
import { DiscordEventRequest, DiscordResponseData, DiscordMember as _DiscordMember } from "discord-bot-cdk-construct";
import { getDiscordSecrets } from "discord-bot-cdk-construct/dist/functions/utils/DiscordSecrets";

interface DiscordMember extends _DiscordMember {
  nick: string;
}

const tableName = process.env.TABLE_NAME || "";
const userRoles =
  process.env.USER_ROLES?.split(",")
    ?.filter(Boolean)
    ?.map((role) => role.trim()) || ([] as string[]);

const storeTranslations = {
  mmat: "Media Markt Austria",
  mmde: "Media Markt Germany",
  mmes: "Media Markt Spain",
  saturn: "Saturn",
};

export async function handler(event: DiscordEventRequest): Promise<string> {
  const response: DiscordResponseData = {
    tts: false,
    content: "Do you control the cookie or does the cookie control you? (Invalid request)",
    embeds: [],
    allowed_mentions: [],
  };
  if (event?.jsonBody?.token) {
    if (userRoles && Array.isArray(userRoles) && !event?.jsonBody?.member?.roles?.some((role) => userRoles.includes(role))) {
      response.content = "⚡️ You requested a cookie but are not authorized for this command! The violation has been recorded.";
      console.log(`User '${(event?.jsonBody?.member as DiscordMember)?.nick}' tried to access the command but is not authorized!`);
    } else {
      const store = event.jsonBody.data?.options?.find((option) => option?.name === "store")?.value as keyof typeof storeTranslations;
      const productId = event.jsonBody.data?.options?.find((option) => option?.name === "product_id")?.value;
      if (store && productId) {
        const client = new DynamoDBClient({});
        const params: UpdateItemCommandInput = {
          TableName: tableName,
          Key: {
            store: { S: store },
            productId: { S: productId },
          },
          UpdateExpression: "REMOVE cookies[0]",
          ReturnValues: "ALL_OLD",
        };
        const dbResponse = await client.send(new UpdateItemCommand(params));
        if (dbResponse.Attributes?.cookies?.L?.length) {
          response.content = `🍪 You requested a cookie for \`${dbResponse.Attributes.title.S}\`, \`${productId}\` at \`${storeTranslations[store]}\`, so here it is: \n<${dbResponse.Attributes.cookies.L[0].S}>`;
        } else {
          response.content = `📭 You requested a cookie for \`${productId}\` at \`${storeTranslations[store]}\`, but I'm out of 🍪. Nom nom nom.`;
        }
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
