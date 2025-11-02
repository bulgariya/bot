import dotenv from "dotenv";
import axios from "axios";
import {
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";

dotenv.config();

const bgjargonCommand = {
  data: {
    name: "bgjargon",
    type: 1,
    description:
      "Get definitions from Bulgarian slang dictionary at bgjargon.com",
    options: [
      {
        name: "word",
        description: "The word to look up",
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
        `https://bgjargon.bulgarian.dev/api?word=${encodeURIComponent(word)}`
      );

      const container = new ContainerBuilder();

      if (!response.data.success || !response.data.data.definitions.length) {
        const notFoundText = new TextDisplayBuilder().setContent(
          `# Думата "${word}" не е намерена в БГ Жаргон\n` +
            "Тази дума не съществува в речника на жаргона или сайтът е недостъпен."
        );

        container.addTextDisplayComponents(notFoundText);
      } else {
        const data = response.data.data;
        const titleText = new TextDisplayBuilder().setContent(
          `# ${data.word} - БГ Жаргон\n` +
            `Открити са ${data.definitions.length} значения в речника на жаргона.`
        );

        container.addTextDisplayComponents(titleText);

        data.definitions.forEach((def, index) => {
          let definitionContent = `## Значение ${index + 1}\n${def.meaning}`;

          if (def.example) {
            definitionContent += `\n\n*"${def.example}"*`;
          }

          definitionContent += `\n\n👍 ${def.votesYes}   👎 ${def.votesNo}`;

          const definitionText = new TextDisplayBuilder().setContent(
            definitionContent
          );
          container.addTextDisplayComponents(definitionText);
        });
      }

      const lookupButton = new ButtonBuilder()
        .setLabel("Отвори в БГ Жаргон")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://www.bgjargon.com/word/meaning/${encodeURIComponent(word)}`
        );

      container.addActionRowComponents((row) =>
        row.addComponents(lookupButton)
      );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Error in bgjargon command:", error);

      const container = new ContainerBuilder();
      const notFoundText = new TextDisplayBuilder().setContent(
        `# Думата "${word}" не е намерена в БГ Жаргон\n` +
          "Тази дума не съществува в речника на жаргона или сайтът е недостъпен."
      );
      container.addTextDisplayComponents(notFoundText);

      const lookupButton = new ButtonBuilder()
        .setLabel("Отвори в БГ Жаргон")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://www.bgjargon.com/word/meaning/${encodeURIComponent(word)}`
        );

      container.addActionRowComponents((row) =>
        row.addComponents(lookupButton)
      );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};

export { bgjargonCommand };
