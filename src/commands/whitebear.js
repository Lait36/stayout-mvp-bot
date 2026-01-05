// srs/commands/whitebear.js

import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('bear')
    .setDescription('Рассчитать время следующего респавна по логу')
    .addStringOption((option) =>
      option.setName('log').setDescription('Лог убийства').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const log = interaction.options.getString('log');

    // Пример лога: [17:29:56][Урон.Исходящий]: Вы убили: Белый медведь - дальний
    const regex = /^\[(\d{2}:\d{2}:\d{2})\]\[Урон\.Исходящий\]: Вы убили: (.+?)\s*-\s*(.+)$/;

    const match = log.match(regex);

    if (!match) {
      return interaction.reply({
        content:
          '❌ Неверный формат сообщения. Пример: `[17:29:56][Урон.Исходящий]: Вы убили: Белый медведь - B2-1`',
        ephemeral: true,
      });
    }

    const timeStr = match[1];
    const mobName = match[2];
    const locationName = match[3];

    // --- Расчет времени респа ---
    const [h, m, s] = timeStr.split(':').map(Number);

    const killTime = new Date();
    killTime.setHours(h, m, s, 0);

    const respawnStart = new Date(killTime.getTime() + 37 * 60 * 1000); // +37м
    // const respawnEnd = new Date(respawnStart.getTime() + 60 * 60 * 1000); // +1ч

    const formatTime = (date) => date.toTimeString().slice(0, 8); // HH:MM:SS

    // --- Красивый вывод ---
    const result = `\`\`\`ansi
📌 [${timeStr}][Урон.Исходящий]: Вы убили: ${mobName} - ${locationName}

🛡️ Следующий респавн:
Начало: \x1b[35m${formatTime(respawnStart)}\x1b[0m
\`\`\``;
    // Конец : \x1b[31m${formatTime(respawnEnd)}\x1b[0m

    await interaction.editReply(result);
  },
};
