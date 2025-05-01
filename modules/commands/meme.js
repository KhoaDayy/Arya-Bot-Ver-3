const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const titles = [
  '🤣 Meme cực troll',
  'Meme này hài vãi 🤣👉',
  'Anh bạn này mặn vãi kk',
  '💀 Oh no...',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Meme cực troll sưu tầm bởi alex.ae79🐧"),

  async execute(interaction) {
    try {
      const res = await axios.get('https://api.hasukatsu.online/images/meme');
      const meme = res.data.result;

      const randomTitle = titles[Math.floor(Math.random() * titles.length)];

      const embed = new EmbedBuilder()
        .setTitle(randomTitle)
        .setImage(meme)
        .setColor(0x5865F2)
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error("Lỗi khi lấy meme:", err);
      await interaction.reply({ content: "❌ Không thể lấy meme lúc này.", ephemeral: true });
    }
  }
};
