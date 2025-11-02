import dotenv from "dotenv";
import axios from "axios";
import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} from "discord.js";
import { requestAI } from "../utils/aiRequest.js";

dotenv.config();

const wordCommand = {
  data: {
    name: "word",
    type: 1,
    description:
      "Get information about a Bulgarian word through various sources",
    options: [
      {
        name: "word",
        description: "The word",
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
      const container = new ContainerBuilder();
      let chitankaData = null;
      let chitankaAvailable = false;

      try {
        const chitankaResponse = await axios.get(
          `https://chitanka.bulgarian.dev/api?word=${encodeURIComponent(word)}`
        );

        if (chitankaResponse.data.success && chitankaResponse.data.data) {
          chitankaData = chitankaResponse.data.data;
          chitankaAvailable = true;
        }
      } catch (chitankaError) {
        console.log("Chitanka API error:", chitankaError.message);
      }

      const titleText = new TextDisplayBuilder().setContent(`# ${word}`);

      const dictionaryButton = new ButtonBuilder()
        .setLabel(
          chitankaAvailable && chitankaData.dictionaryUrl
            ? "View in Dictionary"
            : "Search Online"
        )
        .setStyle(ButtonStyle.Link)
        .setURL(
          chitankaData?.dictionaryUrl ||
            `https://ibl.bas.bg/rbe/lang/bg/${word}`
        );

      const titleSection = new SectionBuilder()
        .addTextDisplayComponents(titleText)
        .setButtonAccessory(dictionaryButton);

      container.addSectionComponents(titleSection);

      let basicInfoContent = "";

      if (chitankaAvailable) {
        if (chitankaData.stressedWord) {
          basicInfoContent += `**Ударение:** ${chitankaData.stressedWord}\n`;
        }

        if (chitankaData.wordType) {
          basicInfoContent += `**Вид дума:** ${chitankaData.wordType}\n`;
        }

        if (chitankaData.wordClass) {
          if (chitankaData.typeLink) {
            basicInfoContent += `**Клас:** [${chitankaData.wordClass}](${chitankaData.typeLink})\n`;
          } else {
            basicInfoContent += `**Клас:** ${chitankaData.wordClass}\n`;
          }
        }
      }

      if (basicInfoContent) {
        const basicInfoText = new TextDisplayBuilder().setContent(
          basicInfoContent
        );
        container.addTextDisplayComponents(basicInfoText);
      }

      container.addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Large)
      );

      let meaningText;
      let footer = "Source: ";

      if (chitankaAvailable && chitankaData.meaning) {
        let limitedMeaning = chitankaData.meaning
          .split("\n")
          .slice(0, 5)
          .join("\n");

        limitedMeaning = limitedMeaning
          .replace(/^(.*?), м\./gm, "$1, м.\n")
          .replace(/(\d+\.\s)/g, "\n$1")
          .replace(/^(\n)+/g, "")
          .trim();

        const englishTranslation = limitedMeaning
          ? await requestAI(
              `Provide a very short one-line English translation of the Bulgarian word "${word}" based on this definition ${limitedMeaning} (one liner):`
            )
          : "";

        meaningText = `## Значение\n${limitedMeaning}${
          englishTranslation
            ? `\n\n**AI Translation:**\n${englishTranslation}`
            : ""
        }`;
        footer += "rechnik.chitanka.info";
      } else {
        let aiMeaning = "";

        try {
          aiMeaning = await requestAI(
            `Provide only a brief one-line explanation of what the Bulgarian word "${word}" means in English. Keep it very concise - maximum one sentence.`
          );
        } catch (aiError) {
          console.log("AI request error:", aiError.message);
          aiMeaning = "Няма налична информация за това слово.";
        }

        meaningText = `## Значение\n**Word not found in Dictionary**\n\n**AI guess:**\n${aiMeaning}`;
        footer += "AI Generated";
      }

      if (meaningText) {
        const meaningSection = new TextDisplayBuilder().setContent(meaningText);
        container.addTextDisplayComponents(meaningSection);
      }

      if (chitankaAvailable && chitankaData.synonyms) {
        container.addSeparatorComponents((separator) =>
          separator.setSpacing(SeparatorSpacingSize.Large)
        );

        const synonymsText = new TextDisplayBuilder().setContent(
          `## Синоними\n${chitankaData.synonyms}`
        );
        container.addTextDisplayComponents(synonymsText);
      }

      let hasLinks = false;
      let linksContent = "";

      if (
        chitankaAvailable &&
        chitankaData.links &&
        chitankaData.links.length > 0
      ) {
        const linksFormatted = chitankaData.links
          .map((link) => `[${link.text}](${link.url})`)
          .join("\n");
        linksContent = linksFormatted;
        hasLinks = true;
      }

      const basLink = `[${word} в bas](https://ibl.bas.bg/rbe/lang/bg/${word})`;
      linksContent = hasLinks ? `${linksContent}\n${basLink}` : basLink;

      container.addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Large)
      );

      const linksText = new TextDisplayBuilder().setContent(
        `## Връзки\n${linksContent}`
      );
      container.addTextDisplayComponents(linksText);

      const footerText = new TextDisplayBuilder().setContent(`-# ${footer}`);
      container.addTextDisplayComponents(footerText);

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("Error in word command:", error);

      const container = new ContainerBuilder();
      const titleText = new TextDisplayBuilder().setContent(
        `# Грешка при търсене на "${word}"\nВъзникна проблем при извличането на информация за тази дума. Моля, опитайте отново по-късно.`
      );
      container.addTextDisplayComponents(titleText);

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};

export { wordCommand };
