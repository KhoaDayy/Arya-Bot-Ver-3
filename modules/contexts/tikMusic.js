const {
  ContextMenuCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("Tiktok Music").setType(3), // 3 = Message context menu

  async execute(interaction) {
    const targetContent = interaction.targetMessage.content;

    const regex =
      /https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._-]+)\/video\/(\d+)/;
    const match = targetContent.match(regex);

    if (!match) {
      await interaction.reply({
        content: "❌ Liên kết không hợp lệ, vui lòng thử lại.",
        ephemeral: true,
      });
      return;
    }

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    await interaction.reply({
      content: `🎵 Đang tải nhạc từ video...`,
      ephemeral: false,
    });

    let audioPath;

    try {
      const res = await axios.get(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(targetContent)}`
      );
      const data = res.data.data;

      if (!data || !data.music) throw new Error("Không có link nhạc từ API.");

      audioPath = path.join(cacheDir, `tiktok-audio-${Date.now()}.mp3`);

      const audioStream = await axios.get(data.music, {
        responseType: "stream",
      });

      const writer = fs.createWriteStream(audioPath);
      audioStream.data.pipe(writer);

      // Chờ ghi xong
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const embed = new EmbedBuilder()
        .setTitle(data.music_info.title || "Audio TikTok")
        .setDescription(`🎵 Tác giả: ${data.music_info.author}`)
        .addFields(
          {
            name: "Thời lượng",
            value: `${data.music_info.duration}s`,
            inline: true,
          },
          {
            name: "Album",
            value: data.music_info.album || "Không rõ",
            inline: true,
          },
          {
            name: "Gốc",
            value: data.music_info.original ? "Có" : "Không",
            inline: true,
          }
        )
        .setColor(0xff0050);

      const attachment = new AttachmentBuilder(audioPath);
      await interaction.editReply({
        content: null,
        embeds: [embed],
        files: [attachment],
        ephemeral: false,
      });
    } catch (err) {
      console.error("Lỗi khi xử lý âm thanh TikTok:", err);
      await interaction.editReply({
        content: "❌ Không thể tải nhạc từ video.",
        ephemeral: false,
      });
    } finally {
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
  },
};
