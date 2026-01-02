import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('test commands'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};
