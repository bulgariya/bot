import { Events } from "discord.js";
import { getChannel, MAIN_SERVER_ID } from "../config/channels.js";

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member) {


  if (member.guild.id !== MAIN_SERVER_ID) {
    return;
  }
  try {
    await getChannel("CHAT").send(
      `Здравей <@${member.id}>! Welcome to Learn Bulgarian :flag_bg:.\n` +
        `To get started, please read the rules in <#${getChannel("RULES").id}> and tell us about yourself in <#${getChannel("INTRODUCTIONS").id}>!`
    );
    console.log(`✓ Welcome message sent for ${member.user.tag}`);
  } catch (error) {
    console.error("Failed to send welcome message:", error);
  }
}
