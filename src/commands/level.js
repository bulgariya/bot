import { EmbedBuilder } from "discord.js";
import { getUserXP } from "../utils/xpSystem.js";

export const levelCommand = {
  data: {
    name: "level",
    type: 1,
    description: "Check your level and stats",
    options: [
      {
        name: "user",
        description: "The user to check ",
        required: false,
        type: 6,
      },
    ],
    integration_types: [0],
    contexts: [0],
  },
  async execute(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const guildId = interaction.guild.id;

    await interaction.deferReply();

    const userData = await getUserXP(targetUser.id, guildId);

    if (!userData) {
      await interaction.editReply({
        content: `${
          targetUser.id === interaction.user.id
            ? "You haven't"
            : "This user hasn't"
        } sent any messages yet!`,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#00966e")
      .setAuthor({
        name: targetUser.username,
        iconURL: targetUser.displayAvatarURL(),
      })
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: "💰 Лева",
          value: `${userData.leva.toLocaleString()} лева`,
          inline: true,
        },
        {
          name: "📊 Ниво",
          value: `Level ${userData.currentLevel}`,
          inline: true,
        },
        {
          name: "🔥 Стрийк",
          value: `${userData.streak} ${userData.streak === 1 ? "ден" : "дни"}`,
          inline: true,
        },
        {
          name: "💬 Съобщения",
          value: `${userData.messages.toLocaleString()}`,
          inline: true,
        },
        {
          name: "📈 Прогрес",
          value: `${userData.xpIntoCurrentLevel}/${userData.xpNeededForNextLevel} XP до следващо ниво`,
          inline: false,
        }
      )
      .setFooter({
        text: `${Math.floor(
          (userData.xpIntoCurrentLevel / userData.xpNeededForNextLevel) * 100
        )}% до Level ${userData.currentLevel + 1}`,
      });

    await interaction.editReply({ embeds: [embed] });
  },
};
