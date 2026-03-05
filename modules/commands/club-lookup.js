const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const { createBar, fmt } = require('../../utils/formatters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guild")
        .setDescription("Tra cứu Bang hội WWM bằng tên")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("Tên bang hội cần tìm")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("server")
                .setDescription("Máy chủ (SEA hoặc CN)")
                .setRequired(false))
    ,
    category: "🎮 Game (WWM)",

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const guildName = interaction.options.getString("name").trim();
            const serverParam = interaction.options.getString("server") || "SEA";

            // 1. Tìm guild bằng tên
            let response;
            try {
                const apiUrl = process.env.WWM_LOCAL_API || "http://localhost:3003";
                response = await axios.get(`${apiUrl}/club_search`, {
                    params: { name: guildName, server: serverParam },
                    timeout: 30000
                });
            } catch (err) {
                if (err.code === 'ECONNREFUSED') {
                    await interaction.deleteReply().catch(() => { });
                    return interaction.followUp({ content: `❌ Service tra cứu (Local API) chưa bật.`, ephemeral: true });
                }
                throw err;
            }

            const data = response.data;

            if (!data || data.error) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({
                    content: `❌ ${data?.error || "Lỗi không xác định khi tìm kiếm."}`,
                    ephemeral: true
                });
            }

            // 2. Lọc kết quả hợp lệ, ưu tiên tên trùng khớp chính xác
            const results = (data.results || []).filter(g => g.name && g.name !== "???" && g.level > 0);

            if (results.length === 0) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({
                    content: `❌ Không tìm thấy bang hội nào có tên **"${guildName}"** trên server **${serverParam}**.`,
                    ephemeral: true
                });
            }

            // Ưu tiên exact match (không phân biệt hoa thường)
            const exact = results.find(g => g.name.toLowerCase() === guildName.toLowerCase());
            const guild = exact || results[0];

            // 3. Build embed
            const level = guild.level || 0;
            const levelBar = createBar(level, 10, 10);
            const createDate = guild.create_ts ? `<t:${Math.floor(guild.create_ts)}:D>` : "N/A";
            const ageStr = guild.create_ts ? `<t:${Math.floor(guild.create_ts)}:R>` : "N/A";
            const purpose = guild.purpose || "Chưa có tôn chỉ hoạt động.";

            const embed = new EmbedBuilder()
                .setAuthor({ name: "🏯 Hồ Sơ Bang Hội" })
                .setTitle(`[Lv.${level}] ${guild.name}`)
                .setColor("#DAA520");

            // Description
            const descParts = [];
            if (purpose.length > 0) {
                const truncated = purpose.length > 300 ? purpose.substring(0, 300) + '...' : purpose;
                descParts.push(`> *"${truncated}"*\n`);
            }
            embed.setDescription(descParts.join("\n"));

            // Fields
            embed.addFields(
                { name: "Cấp Độ", value: `**Lv.${level}** ${levelBar}`, inline: false },
                { name: "👥 Thành Viên", value: `\`${fmt(guild.member_num)}\``, inline: true },
                { name: "💰 Quỹ Bang", value: `\`${fmt(guild.fund)}\``, inline: true },
                { name: "✨ Uy Danh", value: `\`${fmt(guild.fame)}\``, inline: true },
                { name: "🔥 Liveness", value: `\`${fmt(guild.liveness)}\``, inline: true },
                { name: "📅 Ngày Lập", value: `${createDate} (${ageStr})`, inline: true },
                { name: "🌐 Máy Chủ", value: `\`${serverParam} · S${guild.hostnum}\``, inline: true }
            );

            embed.setFooter({ text: `Where Winds Meet · ${serverParam} · S${guild.hostnum}` });
            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("[Guild-Lookup Error]:", error);
            const errMsg = "❌ Đã xảy ra lỗi khi tra cứu Bang hội. Server có thể đang bảo trì.";
            await interaction.deleteReply().catch(() => { });
            await interaction.followUp({ content: errMsg, ephemeral: true }).catch(() => null);
        }
    },
};
