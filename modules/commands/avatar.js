const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar of a user")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to get the avatar of")
        .setRequired(false)
    ),
    category: "📝 Thông tin (Info)",

  async execute(interaction) {
    // Lấy user option hoặc chính user call
    const user = interaction.options.getUser("user") || interaction.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

    // Chỉ embed ảnh, không text gì thêm
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setImage(avatarURL)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp()
        .setTitle(`Avatar của ${user.username} đâyyy!`) 
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`[Link tải về](${avatarURL})`);



    await interaction.reply({ embeds: [embed] });
  },
};
