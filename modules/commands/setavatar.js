// modules/commands/setavatar.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv/config');

const OWNER_ID = process.env.OWNER_ID; // Đặt ID chủ bot trong .env

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setavatar')
    .setDescription('Thay đổi avatar của bot (chỉ chủ bot mới được quyền)')
    .addAttachmentOption(option =>
      option.setName('avatar')
        .setDescription('Tải lên ảnh làm avatar mới cho bot')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Kiểm tra quyền chủ bot
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Chỉ chủ bot mới có thể sử dụng lệnh này.', ephemeral: true });
    }

    const attachment = interaction.options.getAttachment('avatar');
    if (!attachment || !attachment.contentType.startsWith('image/')) {
      return interaction.reply({ content: '❌ Vui lòng đính kèm tệp ảnh hợp lệ.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      // Lấy buffer ảnh từ URL
      const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      // Đặt avatar cho bot
      await interaction.client.user.setAvatar(buffer);
      await interaction.editReply({ content: '✅ Đã cập nhật avatar của bot thành công!' });
    } catch (error) {
      console.error('Error setting bot avatar:', error);
      await interaction.editReply({ content: '❌ Có lỗi khi cập nhật avatar.', ephemeral: true });
    }
  }
};