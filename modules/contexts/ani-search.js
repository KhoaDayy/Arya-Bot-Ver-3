const { default: axios } = require("axios");
const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Anime Search")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    // 1) Defer để có thể editReply sau
    await interaction.deferReply({ ephemeral: true });

    const msg = interaction.targetMessage;

    // 2) Lấy URL ảnh (attachment hoặc text link)
    const imgAtt = msg.attachments.find(a =>
      a.contentType?.startsWith("image/") ||
      /\.(jpe?g|png|gif|webp)$/i.test(a.name || "")
    );

    let imageUrl;
    if (imgAtt) {
      imageUrl = imgAtt.url;
    } else {
      const links = msg.content.match(/https?:\/\/\S+/gi) || [];
      imageUrl = links.find(u => /\.(jpe?g|png|gif|webp)$/i.test(u));
    }

    if (!imageUrl) {
      return interaction.editReply("❌ Không tìm thấy link hoặc file ảnh trong tin nhắn.");
    }

    try {
      // 3) Gọi API của bạn
      const { data } = await axios.get("https://api.hasukatsu.online/anisearch", {
        params: { url: imageUrl }
      });

      if (!data.result?.length) {
        return interaction.editReply("❌ Không tìm thấy kết quả phù hợp.");
      }

      // 4) Format helper
      const formatTime = sec => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
      };

      // 5) Build embeds array
      const embeds = data.result.map((item, i) =>
        new EmbedBuilder()
          .setColor(0x1abc9c)
          .setTitle(item.filename)
          .setURL(item.video)
          .setImage(item.image)
          .addFields(
            { name: "AniList ID", value: `${item.anilist}`, inline: true },
            { name: "Episode",    value: `${item.episode}`,  inline: true },
            { name: "Similarity", value: `${(item.similarity * 100).toFixed(2)}%`, inline: true },
            {
              name: "Timestamp",
              value: `[${formatTime(item.from)}](${item.video}) – ${formatTime(item.to)}`,
              inline: true
            }
          )
          .setFooter({
            text: `Page ${i + 1}/${data.result.length} • frameCount: ${data.frameCount}`
          })
      );

      // 6) Pagination buttons
      let page = 0;
      const makeRow = () =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === embeds.length - 1)
        );

      // 7) Gửi embed đầu tiên
      const sent = await interaction.editReply({
        embeds: [embeds[0]],
        components: [makeRow()]
      });

      // 8) Collector để handle button
      const collector = sent.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 120_000
      });

      collector.on("collect", async btn => {
        if (btn.customId === "next" && page < embeds.length - 1) page++;
        if (btn.customId === "prev" && page > 0) page--;
        await btn.update({
          embeds: [embeds[page]],
          components: [makeRow()]
        });
      });

      collector.on("end", () => {
        // disable hết nút sau khi timeout
        const disabled = makeRow().components.map(b => b.setDisabled(true));
        sent.edit({ components: [new ActionRowBuilder().addComponents(disabled)] });
      });

    } catch (err) {
      console.error("AniSearch API error:", err);
      return interaction.editReply("❌ Có lỗi khi gọi API, thử lại sau.");
    }
  },
};
