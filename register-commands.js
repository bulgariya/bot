import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { wordCommand } from "./src/commands/word.js";
import { stressCommand } from "./src/commands/stress.js";
import { toCyrillicCommand } from "./src/commands/toCyrillic.js";
import {
  translateCommand,
  translateMessageCommand,
} from "./src/commands/translate.js";
import {
  checkCommand,
  checkMessageCommand,
} from "./src/commands/sentence.js";
import { resourcesCommand } from "./src/commands/resources.js";
import { booksCommand } from "./src/commands/books.js";
import { alphabetCommand } from "./src/commands/alphabet.js";
import { bgjargonCommand } from "./src/commands/bgjargon.js";
import { askCommand, askMessageCommand } from "./src/commands/ask.js";



const rest = new REST().setToken(process.env.TOKEN);

rest
  .put(Routes.applicationCommands("1433901865505919108"), { body: [] })
  .then(() => console.log("Successfully deleted all application commands."))
  .catch(console.error);

const commands = [
  wordCommand.data,
  stressCommand.data,
  toCyrillicCommand.data,
  translateCommand.data,
  translateMessageCommand.data,
  resourcesCommand.data,
  booksCommand.data,
  alphabetCommand.data,
  checkCommand.data,
  checkMessageCommand.data,
  bgjargonCommand.data,
  askCommand.data,
  askMessageCommand.data,
];

rest
  .put(Routes.applicationCommands("1433901865505919108"), { body: commands })
  .then(() => console.log("Successfully created all application commands."))
  .catch(console.error);
