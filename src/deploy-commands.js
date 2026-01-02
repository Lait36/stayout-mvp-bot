import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_IDS = [process.env.GUILD_ID, process.env.GUILD_ID_TEST].filter(Boolean); // ✅ несколько серверов

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  const commandData = command.default || command;

  if ('data' in commandData && 'execute' in commandData) {
    commands.push(commandData.data.toJSON());
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
  }
}

const rest = new REST().setToken(TOKEN);

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  for (const GUILD_ID of GUILD_IDS) {
    const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log(`Successfully reloaded ${data.length} commands for guild ${GUILD_ID}`);
  }

  console.log('✅ All commands refreshed successfully.');
} catch (error) {
  console.error(error);
}
