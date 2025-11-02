import { Events } from "discord.js";
import { initializeChannels } from "../config/channels.js";
import { startStatusRotation } from "../utils/statusRotation.js";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
  console.log(`✓ Bot logged in as ${client.user.username}`);

  await initializeChannels(client);

  startStatusRotation(client);

  console.log("✓ Bot is ready!");
}
