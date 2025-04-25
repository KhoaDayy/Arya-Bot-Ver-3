// modules/commands/setavatar.js
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv/config');

const OWNER_ID = process.env.OWNER_ID; // ID chủ bot trong .env

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbot')
    .setDescription('Thay đổi avatar hoặc banner của bot')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Chọn loại ảnh muốn thay')
        .setRequired(true)
        .addChoices(
          { name: 'Avatar', value: 'avatar' },
          { name: 'Banner', value: 'banner' },
        )
    )
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('Tải lên tệp ảnh (PNG/JPEG/GIF)')
        .setRequired(true)
    ),

  async execute(interaction) {
    // 1. Kiểm tra quyền
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Chỉ chủ bot mới có thể sử dụng lệnh này.',
        ephemeral: true
      });
    }

    const type = interaction.options.getString('type');         // 'avatar' hoặc 'banner'
    const attachment = interaction.options.getAttachment('image');

    // 2. Kiểm tra có tệp và đúng định dạng ảnh
    if (!attachment || !attachment.contentType.startsWith('image/')) {
      return interaction.reply({
        content: '❌ Vui lòng đính kèm tệp ảnh hợp lệ (PNG, JPEG hoặc GIF).',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // 3. Fetch buffer từ URL
      const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      // 4. Áp dụng thay đổi theo loại
      if (type === 'avatar') {
        await interaction.client.user.setAvatar(buffer);
        await interaction.editReply('✅ Đã cập nhật **avatar** của bot thành công!');
      } else {
        await interaction.client.user.setBanner(buffer);
        await interaction.editReply('✅ Đã cập nhật **banner** của bot thành công!');
      }
    } catch (error) {
      console.error(`Error setting bot ${type}:`, error);
      await interaction.editReply({
        content: `❌ Có lỗi khi cập nhật ${type}.`,
        ephemeral: true
      });
    }
  }
};
