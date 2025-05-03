const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  const axios = require("axios");
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("ani-search")
      .setDescription("Tìm anime bằng hình ảnh")
      .addSubcommand((opt) =>
        opt
          .setName("link")
          .setDescription("Tìm anime bằng link ảnh")
          .addStringOption((o) =>
            o.setName("url").setDescription("Link ảnh").setRequired(true)
          )
      )
      .addSubcommand((opt) =>
        opt
          .setName("image")
          .setDescription("Tìm anime bằng ảnh tải lên")
          .addAttachmentOption((o) =>
            o.setName("file").setDescription("Ảnh tải lên").setRequired(true)
          )
      ),
  
    async execute(interaction) {
      await interaction.deferReply();
      const sub = interaction.options.getSubcommand();
      const imageUrl =
        sub === "link"
          ? interaction.options.getString("url")
          : interaction.options.getAttachment("file").url;
  
      let data;
      try {
        ({ data } = await axios.get(
          `https://api.hasukatsu.online/anisearch?url=${encodeURIComponent(imageUrl)}`
        ));
      } catch (err) {
        console.error(err);
        return interaction.editReply("❌ Lỗi khi gọi API, thử lại sau.");
      }
  
      if (!data.result.length)
        return interaction.editReply("❌ Không tìm thấy kết quả phù hợp.");
  
      const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
      };
  
      // build array of embeds, dùng index i để set footer page
      const embeds = data.result.map((item, i) =>
        new EmbedBuilder()
          .setColor(0x1abc9c)
          .setTitle(item.filename)
          .setURL(item.video)
          .setImage(item.image)
          .addFields(
            { name: "AniList ID", value: `${item.anilist}`, inline: true },
            { name: "Episode", value: `${item.episode}`, inline: true },
            {
              name: "Similarity",
              value: `${(item.similarity * 100).toFixed(2)}%`,
              inline: true,
            },
            {
              name: "Timestamp",
              value: `[${formatTime(item.from)}](${item.video}) – ${formatTime(
                item.to
              )}`,
              inline: true,
            }
          )
          .setFooter({
            text: `Page ${i + 1}/${data.result.length} • frameCount: ${data.frameCount}`,
          })
      );
  
      // pagination
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
  
      // gửi embed đầu tiên kèm button
      const msg = await interaction.editReply({
        embeds: [embeds[0]],
        components: [makeRow()],
      });
  
      const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 120000,
      });
  
      collector.on("collect", async (btn) => {
        if (btn.customId === "next" && page < embeds.length - 1) page++;
        if (btn.customId === "prev" && page > 0) page--;
        await btn.update({ embeds: [embeds[page]], components: [makeRow()] });
      });
  
      collector.on("end", () => {
        // disable toàn bộ nút
        const disabled = makeRow().components.map((b) => b.setDisabled(true));
        msg.edit({ components: [new ActionRowBuilder().addComponents(disabled)] });
      });
    },
  };
  