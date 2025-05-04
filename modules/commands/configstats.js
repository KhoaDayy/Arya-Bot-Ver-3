const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { loadConfig, saveConfig } = require('../../utils/statsConfig');


module.exports = {
    data: new SlashCommandBuilder()
      .setName('configstats')
      .setDescription('🛠 Thực hiện modal để cấu hình kênh thống kê server'),
    category: '🔧 Quản trị (Admin)',
  
    async execute(interaction) {
      // Chỉ admin mới được quyền sử dụng
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({ content: '❌ Bạn cần quyền Quản trị viên để sử dụng lệnh này.', ephemeral: true });
      }
  
      // Tạo modal
      const modal = new ModalBuilder()
        .setCustomId('configStatsModal')
        .setTitle('Cấu hình kênh Thống kê');
  
      // Tạo 3 input: tổng thành viên, thành viên thật, bot
      const totalInput = new TextInputBuilder()
        .setCustomId('totalChannel')
        .setLabel('Channel ID: Tổng thành viên')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Nhập ID voice channel')
        .setRequired(true);
  
      const membersInput = new TextInputBuilder()
        .setCustomId('membersChannel')
        .setLabel('Channel ID: Thành viên thật')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Nhập ID voice channel')
        .setRequired(true);
  
      const botsInput = new TextInputBuilder()
        .setCustomId('botsChannel')
        .setLabel('Channel ID: Bot')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Nhập ID voice channel')
        .setRequired(true);
  
      // Gói vào ActionRow
      modal.addComponents(
        new ActionRowBuilder().addComponents(totalInput),
        new ActionRowBuilder().addComponents(membersInput),
        new ActionRowBuilder().addComponents(botsInput)
      );
  
      // Hiện modal
      await interaction.showModal(modal);
    }
  };
  