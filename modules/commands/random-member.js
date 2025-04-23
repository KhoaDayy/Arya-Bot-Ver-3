// modules/commands/tvmayman.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random-member')
    .setDescription('🎲 Chọn ngẫu nhiên thành viên may mắn trong nhóm')
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addIntegerOption(option =>
      option
        .setName('số')
        .setDescription('Số lượng thành viên cần chọn (mặc định 1)')
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    // Chỉ dùng được trong group
    if (!interaction.inGuild()) {
      return interaction.reply({ content: '❎ Lệnh chỉ sử dụng được trong server.', ephemeral: true });
    }

    // Lấy số lượng
    const count = interaction.options.getInteger('số') || 1;

    // Fetch tất cả thành viên
    await interaction.guild.members.fetch();

    // Lọc ra các thành viên không phải bot
    const humanMembers = interaction.guild.members.cache
      .filter(member => !member.user.bot)
      .map(member => member.user.username);

    if (humanMembers.length === 0) {
      return interaction.reply({ content: '❎ Không tìm thấy thành viên để chọn.', ephemeral: true });
    }

    // Shuffle mảng
    for (let i = humanMembers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [humanMembers[i], humanMembers[j]] = [humanMembers[j], humanMembers[i]];
    }

    // Lấy ra count người đầu tiên
    const picked = humanMembers.slice(0, count);

    // Tạo embed
    const embed = new EmbedBuilder()
      .setTitle('🎉 Thành viên may mắn')
      .setDescription(picked.join(', '))
      .setColor(0x00FF7F)
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}` })
      .setTimestamp();

    // Gửi kết quả
    await interaction.reply({ embeds: [embed] });
  }
};
