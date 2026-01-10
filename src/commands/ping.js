import { SlashCommandBuilder } from 'discord.js';
import { CHANNELS } from '../config/channel.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('test commands'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
  allowedChannels: [CHANNELS.TESTING],
};
