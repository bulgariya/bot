import { Events } from "discord.js";

import { wordCommand } from "../commands/word.js";
import { stressCommand } from "../commands/stress.js";
import { toCyrillicCommand } from "../commands/toCyrillic.js";
import {
  translateCommand,
  translateMessageCommand,
} from "../commands/translate.js";
import {
  resourcesCommand,
  handleResourcesButtonInteraction,
} from "../commands/resources.js";
import { booksCommand } from "../commands/books.js";
import { alphabetCommand } from "../commands/alphabet.js";
import { checkCommand, checkMessageCommand } from "../commands/sentence.js";
import { bgjargonCommand } from "../commands/bgjargon.js";
import { askCommand, askMessageCommand } from "../commands/ask.js";

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
  if (interaction.isButton()) {

    if (
      interaction.customId.startsWith("resources_prev_") ||
      interaction.customId.startsWith("resources_next_")
    ) {
      await executeCommandSafely(handleResourcesButtonInteraction, interaction);
      return;
    }
  }

  if (interaction.isMessageContextMenuCommand()) {
    const { commandName } = interaction;

    switch (commandName) {
      case "Translate Message":
        await executeCommandSafely(
          translateMessageCommand.execute,
          interaction
        );
        return;
      case "Check Grammar":
        await executeCommandSafely(checkMessageCommand.execute, interaction);
        return;
      case "Ask Bulgaria About This":
        await executeCommandSafely(askMessageCommand.execute, interaction);
        return;
    }
}

  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  switch (commandName) {
    case "word":
      await executeCommandSafely(wordCommand.execute, interaction);
      return;
    case "stress":
      await executeCommandSafely(stressCommand.execute, interaction);
      return;
    case "to-cyrillic":
      await executeCommandSafely(toCyrillicCommand.execute, interaction);
      return;
    case "translate":
      await executeCommandSafely(translateCommand.execute, interaction);
      return;
    case "resources":
      await executeCommandSafely(resourcesCommand.execute, interaction);
      return;
    case "books":
      await executeCommandSafely(booksCommand.execute, interaction);
      return;
    case "alphabet":
      await executeCommandSafely(alphabetCommand.execute, interaction);
      return;
    case "sentence":
      await executeCommandSafely(checkCommand.execute, interaction);
      return;
    case "bgjargon":
      await executeCommandSafely(bgjargonCommand.execute, interaction);
      return;
    case "ask":
      await executeCommandSafely(askCommand.execute, interaction);
      return;
  }

  async function executeCommandSafely(commandExecute, interaction) {
    try {
      await commandExecute(interaction);
    } catch (error) {
      console.error(
        `Error executing command '${interaction.commandName}':`,
        error
      );

      if (interaction.deferred || interaction.replied) {
        await interaction
          .followUp({
            content: "Sorry, there was an error executing this command.",
            ephemeral: true,
          })
          .catch(console.error);
      } else {
        await interaction
          .reply({
            content: "Sorry, there was an error executing this command.",
            ephemeral: true,
          })
          .catch(console.error);
      }
    }
  }
}
