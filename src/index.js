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
  try { // ✅ ИЗМЕНЕНО — try/catch теперь оборачивает ВСЁ

    if (!interaction.isChatInputCommand()) return;

    // 🆕 ДОБАВЛЕНО — защита от ЛС
    if (!interaction.guild) {
      return interaction.reply({
        content: '❌ Команды доступны только на сервере.',
        ephemeral: true,
      });
    }

    // 🆕 ДОБАВЛЕНО — ограничение серверов
    const allowedGuilds = [
      process.env.GUILD_ID,
      process.env.GUILD_ID_TEST,
    ].filter(Boolean);

    if (!allowedGuilds.includes(interaction.guild.id)) {
      return interaction.reply({
        content: '❌ Команды недоступны на этом сервере.',
        ephemeral: true,
      });
    }

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found`);
      return;
    }

    await command.execute(interaction); // ✅ ИЗМЕНЕНО — теперь под защитой

  } catch (error) {
    console.error('🔥 Interaction error:', error);

    // 🆕 ДОБАВЛЕНО — защита от двойного reply
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ Внутренняя ошибка бота.',
        ephemeral: true,
      });
    }
  }
});

client.login(BOTTOKEN);
