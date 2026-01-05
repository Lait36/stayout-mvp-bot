import { Client, Events, GatewayIntentBits, Collection, MessageFlags } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';

const BOTTOKEN = process.env.BOT_TOKEN;
if (!BOTTOKEN) throw new Error('BOT_TOKEN is not defined in .env');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const commandPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith('.js'));

// ----------------------------
// Загрузка команд
// ----------------------------

for (const file of commandFiles) {
  const filePath = path.join(commandPath, file);
  const command = await import(`file://${filePath}`);
  const commandData = command.default || command;

  if ('data' in commandData && 'execute' in commandData) {
    client.commands.set(commandData.data.name, commandData);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing "data" or "execute"`);
  }
}

// ----------------------------
// 🆕 Глобальный обработчик команд
// ----------------------------

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return;

    const allowedGuilds = [process.env.GUILD_ID, process.env.GUILD_ID_TEST].filter(Boolean);
    if (!allowedGuilds.includes(interaction.guild.id)) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // ✅ Все команды должны сами делать deferReply и editReply
    await command.execute(interaction);
  } catch (error) {
    console.error('🔥 Interaction error:', error);
    // ❌ НИКАКИХ reply здесь! Interaction может быть протухшим
  }
});

client.login(BOTTOKEN);
