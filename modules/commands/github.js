const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Lấy thông tin từ GitHub user')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Tên đăng nhập GitHub (username)')
        .setRequired(true)
    ),
  category: '📝 Thông tin (Info)',

  async execute(interaction) {
    const username = interaction.options.getString('username');
    await interaction.deferReply();

    try {
      const response = await axios.get(
        `https://api.sumiproject.net/github/info?username=${encodeURIComponent(username)}`
      );
      const data = response.data;
      // nếu API trả về object trực tiếp
      // nếu bọc trong data.data thì dùng response.data.data

      const embed = new EmbedBuilder()
        .setTitle(data.name || data.login)
        .setURL(data.html_url)
        .setThumbnail(data.avatar_url)
        .setColor(0x24292e)
        .addFields(
          { name: '🆔 ID', value: data.id.toString(), inline: true },
          { name: '📦 Public repos', value: data.public_repos.toString(), inline: true },
          { name: '👥 Followers', value: data.followers.toString(), inline: true },
          { name: '➡️ Following', value: data.following.toString(), inline: true },
          { name: '📍 Location', value: data.location || 'Không rõ', inline: true },
          { name: '📅 Ngày tạo', value: data.ngay_tao || 'Không rõ', inline: true },
          { name: '⏰ Giờ tạo', value: data.gio_tao || 'Không rõ', inline: true }
        );

      if (data.bio) {
        embed.setDescription(data.bio);
      }

      embed.setFooter({ text: `Author: ${interaction.user.username}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi gọi GitHub API:', error);
      await interaction.editReply({ content: '❌ Không thể lấy thông tin. Vui lòng thử lại sau.' });
    }
  }
};