const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const { ClubActivityConfig } = require("../../db/schemas");
const { ClubActivityService } = require("../../services/clubActivity");
const { fmt } = require("../../utils/formatters");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guild-setup")
        .setDescription("Liên kết bang hội (Guild/Club) với server Discord để theo dõi cống hiến")
        .addSubcommand(sub =>
            sub.setName("link")
                .setDescription("Liên kết bang hội với server này")
                .addStringOption(opt =>
                    opt.setName("name")
                        .setDescription("Tên bang hội trong game")
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName("server")
                        .setDescription("Server game (SEA hoặc CN)")
                        .setRequired(false)
                        .addChoices(
                            { name: 'SEA', value: 'SEA' },
                            { name: 'CN', value: 'CN' },
                        ))
        )
        .addSubcommand(sub =>
            sub.setName("unlink")
                .setDescription("Hủy liên kết bang hội khỏi server này")
        )
        .addSubcommand(sub =>
            sub.setName("fetch")
                .setDescription("Fetch thủ công dữ liệu cống hiến bang hội ngay lập tức")
        )
        .addSubcommand(sub =>
            sub.setName("info")
                .setDescription("Xem thông tin bang hội đang liên kết")
        ),
    category: "🏯 Guild Management",

    async execute(interaction) {
        // Cho phép OWNER_ID từ env hoặc Discord Admin dùng lệnh
        const isOwner = interaction.user.id === process.env.OWNER_ID;
        const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

        if (!isOwner && !isAdmin) {
            return interaction.reply({
                content: "❌ Bạn cần quyền **Administrator** hoặc là bot owner để dùng lệnh này.",
                ephemeral: true,
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "link") return handleLink(interaction);
        if (subcommand === "unlink") return handleUnlink(interaction);
        if (subcommand === "fetch") return handleFetch(interaction);
        if (subcommand === "info") return handleInfo(interaction);
    },
};

async function handleLink(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const clubName = interaction.options.getString("name").trim();
    const server = interaction.options.getString("server") || "SEA";
    const guildId = interaction.guildId;

    try {
        // Tìm club qua API
        const apiUrl = process.env.WWM_LOCAL_API || "http://localhost:3003";
        const response = await axios.get(`${apiUrl}/club_search`, {
            params: { name: clubName, server },
            timeout: 30000,
        });

        const data = response.data;
        const results = (data.results || []).filter(g => g.name && g.name !== "???" && g.level > 0);

        if (results.length === 0) {
            return interaction.editReply({
                content: `❌ Không tìm thấy bang hội nào có tên **"${clubName}"** trên server **${server}**.`,
            });
        }

        // Ưu tiên exact match
        const exact = results.find(g => g.name.toLowerCase() === clubName.toLowerCase());
        const club = exact || results[0];

        // Lưu config
        await ClubActivityConfig.findOneAndUpdate(
            { guildId },
            {
                guildId,
                clubId: club.club_id || null,
                clubName: club.name,
                server,
                isActive: true,
            },
            { upsert: true, new: true }
        );

        const embed = new EmbedBuilder()
            .setTitle("✅ Đã liên kết Bang Hội")
            .setColor("#22C55E")
            .setDescription(`Server Discord này đã được gắn với bang hội **${club.name}** (Server: ${server}).`)
            .addFields(
                { name: "🏯 Bang Hội", value: `**${club.name}**`, inline: true },
                { name: "📊 Level", value: `${club.level || 'N/A'}`, inline: true },
                { name: "👥 Thành Viên", value: `${fmt(club.member_num || 0)}`, inline: true },
                { name: "🌐 Server", value: server, inline: true },
            )
            .setFooter({ text: "Dữ liệu sẽ được tự động fetch mỗi tuần (Thứ 2, 03:55)" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        console.error("[Club-Setup Link Error]:", err);
        if (err.code === 'ECONNREFUSED') {
            return interaction.editReply({ content: "❌ Service tra cứu (Local API) chưa bật." });
        }
        await interaction.editReply({ content: "❌ Đã xảy ra lỗi khi liên kết bang hội." });
    }
}

async function handleUnlink(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await ClubActivityConfig.findOneAndUpdate(
        { guildId: interaction.guildId },
        { isActive: false },
        { new: true }
    );

    if (!result) {
        return interaction.editReply({ content: "⚠️ Server này chưa liên kết bang hội nào." });
    }

    await interaction.editReply({
        content: `✅ Đã hủy liên kết bang hội **${result.clubName || 'N/A'}** khỏi server này.`,
    });
}

async function handleFetch(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const service = new ClubActivityService(interaction.client);
        const snapshot = await service.fetchAndSaveSnapshot(interaction.guildId);

        const lowMembers = snapshot.members.filter(m => m.week_activity_point < 1000);

        const embed = new EmbedBuilder()
            .setTitle("📊 Fetch Cống Hiến Thành Công")
            .setColor("#3B82F6")
            .addFields(
                { name: "🏯 Bang Hội", value: `**${snapshot.clubName}** (Lv.${snapshot.clubLevel})`, inline: true },
                { name: "👥 Thành Viên", value: `${snapshot.memberCount}`, inline: true },
                { name: "📅 Tuần", value: snapshot.weekId, inline: true },
                { name: "⚠️ Dưới 1000 điểm", value: `${lowMembers.length} người`, inline: true },
            )
            .setFooter({ text: `Fetched at ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        console.error("[Club-Setup Fetch Error]:", err);
        await interaction.editReply({ content: `❌ ${err.message || 'Lỗi khi fetch dữ liệu.'}` });
    }
}

async function handleInfo(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const config = await ClubActivityConfig.findOne({ guildId: interaction.guildId });

    if (!config || !config.clubName) {
        return interaction.editReply({
            content: "⚠️ Server này chưa liên kết bang hội nào. Dùng `/guild-setup link` để bắt đầu.",
        });
    }

    const embed = new EmbedBuilder()
        .setTitle("🏯 Thông Tin Liên Kết Bang Hội")
        .setColor(config.isActive ? "#22C55E" : "#EF4444")
        .addFields(
            { name: "Tên Bang", value: config.clubName || 'N/A', inline: true },
            { name: "Club ID", value: config.clubId || 'N/A', inline: true },
            { name: "Server", value: config.server || 'SEA', inline: true },
            { name: "Trạng thái", value: config.isActive ? '✅ Đang hoạt động' : '❌ Đã tắt', inline: true },
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}
