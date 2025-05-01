const { ContextMenuCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("Tiktok Info").setType(3),

  async execute(interaction) {
    const targetContent = interaction.targetMessage.content;

    const regex =
      /https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._-]+)(?:\/video\/(\d+))?/;

    const match = targetContent.match(regex);

    if (!match) {
      await interaction.reply({
        content: "❌ Liên kết không hợp lệ, vui lòng thử lại.",
        ephemeral: true,
      });
      return;
    }

    const username = match[1];

    await interaction.reply({
        
      content: `📄 Đang lấy bài đăng từ người dùng **@${username}**...`,
      ephemeral: false,
    });

    try {
      const res = await axios.get(
        `https://www.tikwm.com/api/user/posts?unique_id=${encodeURIComponent(
          username
        )}`
      );

      const posts = res.data.data.videos.slice(0, 5);
      if (!posts || posts.length === 0) {
        throw new Error("Không có bài đăng nào.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`📹 Video mới nhất từ @${username}`)
        .setColor(0xff0050)
        .setTimestamp()
        .setFooter({ text: `Requested by:${interaction.user.username} ` });

      posts.forEach((post, index) => {
        const title = post.title?.trim() || "(Không có tiêu đề)";
        const duration = `${post.duration}s`;
        const likes = post.digg_count.toLocaleString();
        const comments = post.comment_count.toLocaleString();
        const shares = post.share_count.toLocaleString();

        // 👉 Tạo lại link gốc TikTok
        const authorUsername = post.author?.unique_id || username;
        const tiktokUrl = `https://www.tiktok.com/@${authorUsername}/video/${post.video_id}`;

        embed.addFields({
          name: `▶️ ${index + 1}. ${title}`,
          value:
            `🕒 **Thời lượng:** ${duration}\n` +
            `❤️ **${likes}**   💬 **${comments}**   🔁 **${shares}**\n` +
            `[📎 Xem video trên TikTok](${tiktokUrl})`,
          inline: false,
        });
      });

      if (posts[0]?.author?.avatar) {
        embed.setThumbnail(posts[0].author.avatar);
      }

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (err) {
      console.error("TikTok Info Error:", err);
      await interaction.editReply({
        content: "❌ Không thể lấy bài đăng người dùng.",
      });
    }
  },
};
