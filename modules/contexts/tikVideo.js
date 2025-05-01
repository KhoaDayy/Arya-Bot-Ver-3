// modules/contexts/tikvideo.js
const { ContextMenuCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Tiktok Video")
    .setType(3), // 3 = Message context menu

  async execute(interaction) {
    const targetContent = interaction.targetMessage.content;

    // Regex để lấy URL TikTok
    const regex = /https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._-]+)\/video\/(\d+)/;
    const match = targetContent.match(regex);

    if (!match) {
      await interaction.reply({
        content: "❌ Liên kết không hợp lệ, vui lòng thử lại.",
        ephemeral: true,
      });
      return;
    }

    // Tạo thư mục cache nếu chưa có
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    await interaction.reply({
      content: `📥 Đang tải video...`,
      ephemeral: false,
    });

    try {
      const res = await axios.get(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(targetContent)}`
      );
      const data = res.data.data;

      if (!data || !data.play) {
        throw new Error("Không tìm thấy link video từ API");
      }

      const videoPath = path.join(cacheDir, `tiktok-${Date.now()}.mp4`);

      // Tải video stream về file
      const videoStream = await axios.get(data.play, { responseType: "stream" });
      const writer = fs.createWriteStream(videoPath);
      videoStream.data.pipe(writer);

      // Đợi video ghi xong hoặc lỗi
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Tạo Embed thông tin video
      const embed = new EmbedBuilder()
        .setTitle(data.title || "Video TikTok")
        .setURL(targetContent)
        .setDescription(`👤 ${data.author.nickname} (@${data.author.unique_id})`)
        .addFields(
          { name: "❤️ Lượt tim", value: data.digg_count.toLocaleString(), inline: true },
          { name: "💬 Bình luận", value: data.comment_count.toLocaleString(), inline: true },
          { name: "🔁 Chia sẻ", value: data.share_count.toLocaleString(), inline: true },
          { name: "⬇️ Tải xuống", value: data.download_count.toLocaleString(), inline: true },
          { name: "⏱ Thời lượng", value: `${data.duration}s`, inline: true }
        )
        .setThumbnail(data.origin_cover)
        .setColor(0xff0050);

      const attachment = new AttachmentBuilder(videoPath);
      await interaction.editReply({
        content: null,
        embeds: [embed],
        files: [attachment],
        ephemeral: false,
      });

      fs.unlinkSync(videoPath);
    } catch (err) {
      console.error("Lỗi khi xử lý video TikTok:", err);
      await interaction.editReply({
        content: "❌ Không thể tải video. Có thể link lỗi hoặc API quá tải.",
        ephemeral: false,
      });
    }
  },
};
