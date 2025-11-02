export const CHANNEL_IDS = {
  CHAT: "658661467091894287",
  RULES: "658658532786176022",
  INTRODUCTIONS: "692855267540598784",
};

export const MAIN_SERVER_ID = process.env.MAIN_SERVER;
export const ADMIN_ID = process.env.ADMIN;

let channels = {};

export async function initializeChannels(client) {
  for (const [name, id] of Object.entries(CHANNEL_IDS)) {
    try {
      channels[name] = await client.channels.fetch(id);
      console.log(`✓ Channel ${name} loaded`);
    } catch (error) {
      console.error(`✗ Failed to load channel ${name}:`, error.message);
    }
  }
}

export function getChannel(name) {
  return channels[name];
}
