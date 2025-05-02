const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('phatnguoi')
    .setDescription('Kiểm tra phạt nguội theo biển số')
    .addStringOption(opt =>
      opt.setName('bien_so')
         .setDescription('Ví dụ: 51G-693.53')
         .setRequired(true)
    ),

  async execute(interaction) {
    const bienSo = interaction.options.getString('bien_so').trim();
    await interaction.deferReply();

    try {
      const res = await axios.get(`https://api.sumiproject.net/gtl/phatnguoi?bien_so=${encodeURIComponent(bienSo)}`);
      const body = res.data;
      if (body.status !== 1 || !body.data.length) {
        return interaction.editReply('Không tìm thấy kết quả phạt nguội.');
      }

      const info = body.data[0];
      const stats = body.data_info;

      const embed = new EmbedBuilder()
        .setTitle(`📋 Phạt nguội: ${info["Biển kiểm soát"]}`)
        .setColor(info["Trạng thái"] === 'Chưa xử phạt' ? 0xFFA500 : 0x00AA00)
        .addFields(
          { name: 'Màu biển',           value: info["Màu biển"],                     inline: true },
          { name: 'Loại phương tiện',   value: info["Loại phương tiện"],             inline: true },
          { name: 'Trạng thái',         value: info["Trạng thái"],                   inline: true },
          { name: 'Thời gian vi phạm',  value: info["Thời gian vi phạm"],            inline: false },
          { name: 'Địa điểm vi phạm',   value: info["Địa điểm vi phạm"],             inline: false },
          { name: 'Hành vi vi phạm',    value: info["Hành vi vi phạm"],              inline: false },
          { name: 'Đơn vị phát hiện',    value: info["Đơn vị phát hiện vi phạm"],     inline: false },
          { name: 'Nơi giải quyết',      value: info["Nơi giải quyết vụ việc"].join('\n'), inline: false }
        )
        .setFooter({ text: `Kết quả: tổng ${stats.total}, chưa xử ${stats.chuaxuphat}, đã xử ${stats.daxuphat}` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return interaction.editReply('Có lỗi khi gọi API, hãy thử lại sau.');
    }
  }
};
