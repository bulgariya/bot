import dotenv from "dotenv";
import { EmbedBuilder } from "discord.js";
import { requestAI } from "../utils/aiRequest.js";

dotenv.config();

const MAX_TEXT_LENGTH = 1000;

const askCommand = {
  data: {
    name: "ask",
    type: 1,
    description: "Ask Bulgaria a general question",
    options: [
      {
        name: "question",
        description: "Your question for Bulgaria (1000 characters max)",
        required: true,
        type: 3,
      },
      {
        name: "hidden",
        description: "Do you want to hide the answer from other users?",
        required: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const question = interaction.options.getString("question");
    const hidden = interaction.options.getBoolean("hidden") ?? false;
    const userId = interaction.user.id;

    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setColor(0xff0000)
      .setDescription("An error occurred.");

    await interaction.deferReply({ ephemeral: hidden });

    if (question.length > MAX_TEXT_LENGTH) {
      await interaction.editReply({
        content:
          "Your question is too long! Please limit it to 1000 characters.",
      });
      return;
    }

    const questionEmbed = new EmbedBuilder()
      .setDescription(question)
      .setColor("#00966e")
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      });

    try {
      const response = await requestAI(question, userId, 1);

      if (response.length > 2000) {
        await interaction.editReply({
          content: "The answer is too long!",
        });
        return;
      }

      if (!response || response.trim().length === 0) {
        await interaction.editReply({
          content: "Bulgaria returned an empty response or something went wrong!",
        });
        return;
      }

      const responseEmbed = new EmbedBuilder()
        .setDescription(response)
        .setColor("#00966e")
        .setAuthor({
          name: "Bulgaria",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.editReply({
        embeds: [questionEmbed, responseEmbed],
      });
    } catch (error) {
      console.log(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

const askMessageCommand = {
  data: {
    name: "Ask Bulgaria About This",
    type: 3,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const message = interaction.targetMessage;
    const text = message.content;
    const hidden = false;
    const userId = interaction.user.id;

    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setColor(0xff0000)
      .setDescription("An error occurred.");

    await interaction.deferReply({ ephemeral: hidden });

    if (!text || text.length === 0) {
      await interaction.editReply({
        content: "The message has no text content to analyze.",
      });
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      await interaction.editReply({
        content: "The text is too long! Please limit it to 1000 characters.",
      });
      return;
    }

    const questionEmbed = new EmbedBuilder()
      .setDescription(text)
      .setColor("#00966e")
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      });

    try {
      const response = await requestAI(text, userId, 1);

      if (response.length > 2000) {
        await interaction.editReply({
          content: "The answer is too long!",
        });
        return;
      }

      if (!response || response.trim().length === 0) {
        await interaction.editReply({
          content:
            "Bulgaria returned an empty response or something went wrong!",
        });
        return;
      }

      const responseEmbed = new EmbedBuilder()
        .setDescription(response)
        .setColor("#00966e")
        .setAuthor({
          name: "Bulgaria",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.editReply({
        embeds: [questionEmbed, responseEmbed],
      });
    } catch (error) {
      console.log(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

export { askCommand, askMessageCommand };
