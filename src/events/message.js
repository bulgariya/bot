import { Events } from "discord.js";
import { getChannel, MAIN_SERVER_ID } from "../config/channels.js";
import { handleGenerateCommand } from "../utils/generateSentence.js";
import { addXP, sendStreakNotification } from "../utils/xpSystem.js";

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message) {
  if (message.author.bot) return;

  if (message.guild && message.guild.id === MAIN_SERVER_ID) {
    try {
      const result = await addXP(
        message.author.id,
        message.guild.id,
        message.content
      );

      if (result.isStreakMessage && result.newStreak > 1) {
        await sendStreakNotification(
          message,
          result.newStreak,
          result.streakBonus + result.milestoneBonus,
          message.author.displayAvatarURL()
        );
      }

      if (result.leveledUp) {
        const levelUpMsg = await message.channel.send(
          `-# 🎉 ${message.author} достигна ниво ${result.newLevel}!`
        );
        setTimeout(() => {
          levelUpMsg.delete().catch(() => {});
        }, 10000);
      }
    } catch (error) {
      console.error("Error in XP system:", error);
    }
  }

  await handleGenerateCommand(message);
}
