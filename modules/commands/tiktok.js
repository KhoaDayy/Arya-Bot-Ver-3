const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tiktok")
    .setDescription("Lấy thông tin từ TikTok")
    .addSubcommand(sub =>
      sub.setName("info")
        .setDescription("Xem thông tin người dùng")
        .addStringOption(option => option.setName("username").setDescription("Tên tài khoản TikTok").setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName("video")
        .setDescription("Tải video TikTok")
        .addStringOption(option => option.setName("url").setDescription("Link video TikTok").setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName("music")
        .setDescription("Tải âm thanh từ video TikTok")
        .addStringOption(option => option.setName("url").setDescription("Link video TikTok").setRequired(true))
    )
      .addSubcommand(sub =>
      sub.setName("search")
        .setDescription("Tìm video TikTok theo từ khóa")
        .addStringOption(option => option.setName("keyword").setDescription("Từ khóa tìm kiếm").setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName("trending")
        .setDescription("Xem video TikTok thịnh hành")
    )
    .addSubcommand(sub =>
      sub.setName("post")
        .setDescription("Xem bài đăng của người dùng TikTok")
        .addStringOption(option => option.setName("username").setDescription("Tên tài khoản TikTok").setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    if (sub === "info") {
      const username = interaction.options.getString("username");
      await interaction.reply({ content: `🔎 Đang tìm kiếm người dùng TikTok...`, ephemeral: false });
      try {
        const res = await axios.get(`https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(username)}`);
        const { user, stats } = res.data.data;

        const embed = new EmbedBuilder()
          .setTitle(`👤 ${user.nickname} (@${user.uniqueId})`)
          .setURL(`https://www.tiktok.com/@${user.uniqueId}`)
          .setDescription(user.signature || "Không có mô tả")
          .setThumbnail(user.avatarMedium)
          .addFields(
            { name: "ID", value: user.id.toString(), inline: true },
            { name: "Khu vực", value: user.region || "Không rõ", inline: true },
            { name: "Video", value: stats.videoCount.toString(), inline: true },
            { name: "Theo dõi", value: stats.followerCount.toLocaleString("vi-VN"), inline: true },
            { name: "Đang theo dõi", value: stats.followingCount.toLocaleString("vi-VN"), inline: true },
            { name: "Lượt tim", value: stats.heartCount.toLocaleString("vi-VN"), inline: true }
          )
          .setColor(0xff0050);

        await interaction.editReply({ content: "", embeds: [embed], ephemeral: false });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Không thể tìm thấy người dùng hoặc xảy ra lỗi." });
      }
    }

    if (sub === "video") {
      const url = interaction.options.getString("url");
      await interaction.reply({ content: `📥 Đang tải video...`, ephemeral: false });

      try {
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = res.data.data;
        const videoPath = path.join(cacheDir, `tiktok-${Date.now()}.mp4`);

        const videoStream = await axios.get(data.play, { responseType: "stream" });
        const writer = fs.createWriteStream(videoPath);
        videoStream.data.pipe(writer);

        writer.on("finish", async () => {
          const embed = new EmbedBuilder()
            .setTitle(data.title || "Video TikTok")
            .setURL(url)
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
          await interaction.editReply({ embeds: [embed], files: [attachment], ephemeral: false });
          fs.unlinkSync(videoPath);
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Không thể tải video." });
      }
    }

    if (sub === "music") {
      const url = interaction.options.getString("url");
      await interaction.reply({ content: `🎵 Đang tải nhạc từ video...`, ephemeral: false });

      try {
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = res.data.data;
        const audioPath = path.join(cacheDir, `tiktok-audio-${Date.now()}.mp3`);

        const audioStream = await axios.get(data.music, { responseType: "stream" });
        const writer = fs.createWriteStream(audioPath);
        audioStream.data.pipe(writer);

        writer.on("finish", async () => {
          const embed = new EmbedBuilder()
            .setTitle(data.music_info.title || "Audio TikTok")
            .setDescription(`🎵 Tác giả: ${data.music_info.author}`)
            .addFields(
              { name: "Thời lượng", value: `${data.music_info.duration}s`, inline: true },
              { name: "Album", value: data.music_info.album || "Không rõ", inline: true },
              { name: "Gốc", value: data.music_info.original ? "Có" : "Không", inline: true }
            )
            .setColor(0xff0050);

          const attachment = new AttachmentBuilder(audioPath);
          await interaction.editReply({ embeds: [embed], files: [attachment], ephemeral: false });
          fs.unlinkSync(audioPath);
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Không thể tải nhạc từ video." });
      }
    } else  if (sub === "search") {
      const keyword = interaction.options.getString("keyword");
      await interaction.reply({ content: `🔍 Đang tìm kiếm video TikTok với từ khóa: ${keyword}`, ephemeral: true });
      try {
        const res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(keyword)}`);
        const results = res.data.data.videos.slice(0, 5);

        if (results.length === 0) return interaction.editReply({ content: "❌ Không tìm thấy kết quả phù hợp." });

        const embed = new EmbedBuilder()
          .setTitle(`🔎 Kết quả tìm kiếm TikTok cho "${keyword}"`)
          .setColor(0xff0050);

        results.forEach((vid, i) => {
          embed.addFields({
            name: `${i + 1}. ${vid.author.nickname}`,
            value: `🎥 ${vid.title} | ❤️ ${vid.digg_count} | ⏱ ${vid.duration}s`,
            inline: false
          });
        });

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Lỗi khi tìm kiếm video." });
      }
    }

    if (sub === "trending") {
      await interaction.reply({ content: `📈 Đang tải danh sách video thịnh hành TikTok...`, ephemeral: false });
      try {
        const res = await axios.get("https://www.tikwm.com/api/feed/list?region=VN");
        const list = res.data.data.slice(0, 5);

        const embed = new EmbedBuilder()
          .setTitle("🔥 TikTok Trending (VN)")
          .setColor(0xff0050);

        list.forEach((vid, i) => {
          embed.addFields({
            name: `${i + 1}. ${vid.author.nickname}`,
            value: `🎥 ${vid.title} | ❤️ ${vid.digg_count} | ⏱ ${vid.duration}s`,
            inline: false
          });
        });

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Không thể lấy danh sách thịnh hành." });
      }
    }

    if (sub === "post") {
      const username = interaction.options.getString("username");
      await interaction.reply({ content: `📄 Đang lấy bài đăng từ người dùng ${username}...`, ephemeral: true });
      try {
        const res = await axios.get(`https://www.tikwm.com/api/user/posts?unique_id=${encodeURIComponent(username)}`);
        const posts = res.data.data.videos.slice(0, 5);

        const embed = new EmbedBuilder()
          .setTitle(`📰 Bài đăng gần đây của ${username}`)
          .setColor(0xff0050);

        posts.forEach((post, i) => {
          embed.addFields({
            name: `${i + 1}. ${post.title}`,
            value: `❤️ ${post.digg_count} | 💬 ${post.comment_count} | ⏱ ${post.duration}s`,
            inline: false
          });
        });

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Không thể lấy bài đăng người dùng." });
      }
    }
  }
};