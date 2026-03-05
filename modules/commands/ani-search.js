const {
    SlashCommandBuilder,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const axios = require("axios");

// Regex validate URL đơn giản — tránh nhận input rác
const URL_REGEX = /^https?:\/\/.+/i;

// Hàm lầy thông tin chi tiết từ AniList
async function fetchAniListInfo(id) {
    const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          color
        }
        episodes
        status
        averageScore
        genres
      }
    }
  `;
    try {
        const response = await axios.post("https://graphql.anilist.co", {
            query,
            variables: { id },
        });
        return response.data.data.Media;
    } catch (error) {
        console.error("AniList API Error:", error.message);
        return null;
    }
}

// Hàm format thời gian (mm:ss)
const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

// Hàm tạo thanh tiến trình similarity
const createProgressBar = (pct) => {
    const size = 10;
    const progress = Math.round(size * pct);
    const emptyProgress = size - progress;
    const progressText = "▇".repeat(progress);
    const emptyProgressText = "—".repeat(emptyProgress);
    return `**[${progressText}${emptyProgressText}]** ${(pct * 100).toFixed(2)}%`;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ani-search")
        .setDescription("Tìm kiếm Anime thông qua hình ảnh (Trace.moe)")
        .addSubcommand((sub) =>
            sub
                .setName("link")
                .setDescription("Tìm bằng đường dẫn (URL) ảnh")
                .addStringOption((opt) =>
                    opt
                        .setName("url")
                        .setDescription("Dán link ảnh vào đây")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("image")
                .setDescription("Tìm bằng cách tải ảnh lên")
                .addAttachmentOption((opt) =>
                    opt
                        .setName("file")
                        .setDescription("Chọn ảnh từ máy tính/điện thoại")
                        .setRequired(true)
                )
        ),
    category: "🎬 Media",
    cooldown: 5,

    async execute(interaction) {
        await interaction.deferReply();

        const sub = interaction.options.getSubcommand();
        const imageUrl =
            sub === "link"
                ? interaction.options.getString("url")
                : interaction.options.getAttachment("file").url;

        // Validate URL cơ bản (chỉ cần thiết với link, attachment URL từ Discord đã tin tưởng)
        if (sub === "link" && !URL_REGEX.test(imageUrl)) {
            return interaction.editReply({
                content: "❌ URL không hợp lệ. Vui lòng cung cấp link ảnh bắt đầu bằng `http://` hoặc `https://`.",
            });
        }

        try {
            const { data } = await axios.get(
                `https://api.trace.moe/search?url=${encodeURIComponent(imageUrl)}`,
                { timeout: 15_000 } // timeout 15s
            );

            if (!data.result || data.result.length === 0) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({
                    content: "❌ Không tìm thấy kết quả nào khớp với ảnh này.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            // Lấy top 5 kết quả
            const results = data.result.slice(0, 5);

            // ✅ FIX: Gọi AniList song song thay vì tuần tự (giảm từ ~1.5s → ~300ms)
            const aniInfos = await Promise.allSettled(
                results.map(item => fetchAniListInfo(item.anilist))
            );

            const containers = results.map((item, i) => {
                const aniInfo = aniInfos[i].status === 'fulfilled' ? aniInfos[i].value : null;

                const title = aniInfo?.title?.english || aniInfo?.title?.romaji || item.filename;
                const nativeTitle = aniInfo?.title?.native || "N/A";
                const score = aniInfo?.averageScore ? `${aniInfo.averageScore}/100` : "N/A";
                const color = aniInfo?.coverImage?.color || "#1abc9c"; // Note: V2 doesn't technically use this color directly in the same way, but keeping it for reference or if you need to use it in text.
                const genres = aniInfo?.genres?.slice(0, 3).join(", ") || "N/A";

                const container = new ContainerBuilder();

                let content = `## 🎬 [${title}](https://anilist.co/anime/${item.anilist})\n`;
                content += `*${nativeTitle}*\n\n`;
                content += `**📊 Độ chính xác:** ${createProgressBar(item.similarity)}\n`;
                content += `**🎞️ Tập số:** ${item.episode || "Movie/Special"} | **⏳ Thời điểm:** \`${formatTime(item.from)}\` → \`${formatTime(item.to)}\`\n`;
                content += `**⭐ Đánh giá:** \`${score}\` | **🏷️ Thể loại:** \`${genres}\`\n\n`;
                content += `*Kết quả ${i + 1}/${results.length} • trace.moe*`;

                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));

                if (item.image) {
                    container.addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems(
                            new MediaGalleryItemBuilder().setURL(item.image)
                        )
                    );
                }

                return container;
            });

            let page = 0;
            const getRow = (p) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("Trước")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(p === 0),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("Sau")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(p === containers.length - 1),
                    new ButtonBuilder()
                        .setLabel("Xem Video Preview")
                        .setURL(results[p].video)
                        .setStyle(ButtonStyle.Link)
                );
            };

            const response = await interaction.editReply({
                components: [containers[0], getRow(0)],
                flags: MessageFlags.IsComponentsV2
            });

            const collector = response.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60000,
            });

            collector.on("collect", async (i) => {
                if (i.customId === "next") page++;
                else if (i.customId === "prev") page--;

                await i.update({
                    components: [containers[page], getRow(page)],
                    flags: MessageFlags.IsComponentsV2
                });
            });

            collector.on("end", () => {
                interaction.editReply({ components: [] }).catch(() => { });
            });

        } catch (error) {
            console.error("[ani-search] Error:", error.message);
            await interaction.deleteReply().catch(() => { });
            return interaction.followUp({
                content: "❌ Đã có lỗi xảy ra trong quá trình tìm kiếm. Vui lòng thử lại sau.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};

