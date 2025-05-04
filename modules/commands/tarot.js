const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tarot')
    .setDescription('🔮 Rút một lá bài Tarot ngẫu nhiên')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Số thứ tự lá bài muốn rút (nếu biết)')
        .setRequired(false)
    ),
    category: '🎉 Giải trí & Game',

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const tarotData = (await axios.get('https://raw.githubusercontent.com/KhoaDayy/tarot/refs/heads/main/tarot.json')).data;
      const userIndex = interaction.options.getInteger('number');

      if (userIndex !== null && (userIndex < 0 || userIndex >= tarotData.length)) {
        return interaction.editReply('⚠️ Số thứ tự không hợp lệ hoặc vượt quá số bài hiện có.');
      }

      const index = userIndex ?? Math.floor(Math.random() * tarotData.length);
      const card = tarotData[index];

      const splitField = (label, text) => {
        if (!text) return [{ name: label, value: 'Không có thông tin.' }];
        const chunks = [];
        const sentences = text.split(/(?<=[.!?])\s+/); // tách câu
        let currentChunk = '';

        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > 1024) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence + ' ';
          } else {
            currentChunk += sentence + ' ';
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());

        return chunks.map((chunk, i) => ({ name: i === 0 ? label : '\u200B', value: chunk }));
      };

      const descriptionFields = splitField('✴️ Mô tả', card.vi.description);
      const interpretationFields = splitField('🏷️ Diễn dịch', card.vi.interpretation);
      const reversedFields = splitField('📜 Bài ngược', card.vi.reversed);

      const embed = new EmbedBuilder()
        .setTitle(`🔮 BÓI BÀI TAROT - ${card.name}`)
        .setDescription(`**Thuộc bộ:** ${card.suite} - Lá bài số ${index}`)
        .addFields(...descriptionFields, ...interpretationFields, ...reversedFields)
        .setImage(card.image)
        .setColor(0x8A2BE2)
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Đã xảy ra lỗi khi lấy dữ liệu Tarot.');
    }
  }
};