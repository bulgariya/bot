import dotenv from "dotenv";
import axios from "axios";
import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} from "discord.js";

dotenv.config();

const stressCommand = {
  data: {
    name: "stress",
    type: 1,
    description: "Find the right pronunciation of a word",
    options: [
      {
        name: "word",
        description: "The word you want to check",
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
    const word = interaction.options.getString("word");
    const hidden = interaction.options.getBoolean("hidden");

    await interaction.deferReply({ ephemeral: hidden });

    try {
      const response = await axios.get(
        `https://chitanka.bulgarian.dev/api?word=${encodeURIComponent(word)}`
      );

      const container = new ContainerBuilder();

      if (!response.data.success) {
        throw new Error("Word not found");
      }

      const data = response.data.data;

      const titleText = new TextDisplayBuilder().setContent(
        `# Pronunciation of the word ${word}`
      );
      container.addTextDisplayComponents(titleText);

      const resultText = new TextDisplayBuilder().setContent(
        data.stressedWord
          ? data.stressedWord
          : `Pronunciation for the word ${word} not found :(`
      );
      container.addTextDisplayComponents(resultText);

      const dictionaryButton = new ButtonBuilder()
        .setLabel("View in Dictionary")
        .setStyle(ButtonStyle.Link)
        .setURL(data.dictionaryUrl);

      container.addActionRowComponents((row) =>
        row.addComponents(dictionaryButton)
      );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Error in stress command:", error);

      const container = new ContainerBuilder();

      const titleText = new TextDisplayBuilder().setContent(
        "# Думата не е намерена\nТърсената дума липсва в речника."
      );
      container.addTextDisplayComponents(titleText);

      const noSimilarWordsText = new TextDisplayBuilder().setContent(
        "## Подобни думи\nНяма подобни думи"
      );
      container.addTextDisplayComponents(noSimilarWordsText);

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};

export { stressCommand };
