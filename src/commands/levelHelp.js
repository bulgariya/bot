import { EmbedBuilder } from "discord.js";

export const levelHelpCommand = {
  data: {
    name: "levelhelp",
    type: 1,
    description: "Learn how the Leva system works",
    integration_types: [0],
    contexts: [0],
  },
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#00966e")
      .setTitle("💰 Лева System Guide")
      .setDescription(
        "Earn **Лева** (XP) by being active and building your streak!"
      )
      .addFields(
        {
          name: "📝 Basic XP",
          value:
            "• **1 лева** per message\n" +
            "• **2 лева** per message in Cyrillic\n",
          inline: false,
        },
        {
          name: "🔥 Streak System",
          value:
            "Send at least one message each day to maintain your streak!\n\n" +
            "**Daily Streak Bonuses:**\n" +
            "• Day 1: No bonus (starting streak)\n" +
            "• Day 2: **+2 лева** (first message of the day)\n" +
            "• Day 3: **+3 лева**\n" +
            "• Day 4: **+4 лева**\n" +
            "• Day 5+: **+5 лева** every day\n\n" +
            "⚠️ **Miss a day? Your streak resets to 0!**",
          inline: false,
        },
        {
          name: "🏆 Milestone Bonuses",
          value:
            "Reach these streak milestones for HUGE one-time bonuses:\n\n" +
            "• **10 days**: +32 лева 🎯\n" +
            "• **30 days**: +64 лева 🌟\n" +
            "• **180 days** (6 months): +500 лева 💎\n" +
            "• **365 days** (1 year): +1,000 лева 👑",
          inline: false,
        },
        {
          name: "📊 Leveling System",
          value:
            "Your level increases as you earn more лева!\n\n" +
            "• Each level requires more XP than the last\n" +
            "• Level 1: 50 лева\n" +
            "• Level 2: 122 лева total (72 more)\n" +
            "• Level 3: 214 лева total (92 more)\n" +
            "• And so on... it gets harder!",
          inline: false,
        },
        {
          name: "📱 Commands",
          value:
            "• `/level` - Check your stats\n" +
            "• `/level @user` - Check someone else's stats\n" +
            "• `/xphelp` - Show this guide",
          inline: false,
        }
      )
      .setFooter({
        text: "Start building your streak today! 🔥",
      })
      .setThumbnail(interaction.client.user.displayAvatarURL());

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
