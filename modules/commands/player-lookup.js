const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const moment = require("moment-timezone");

// Màu và emoji theo Sect
const SECT_INFO = {
    "Silver Needle": { emoji: "", color: "#C0C0C0" },
    "Tangmen": { emoji: "", color: "#8B4513" },
    "Shaolin": { emoji: "", color: "#DAA520" },
    "The Masked Troupe": { emoji: "", color: "#4169E1" },
    "Emei": { emoji: "", color: "#FF69B4" },
    "Beggar": { emoji: "", color: "#8B7355" },
    "Scholar": { emoji: "", color: "#87CEEB" },
    "Flower": { emoji: "", color: "#FF1493" },
    "Five Immortals": { emoji: "", color: "#9932CC" },
    "Wudu": { emoji: "", color: "#7B68EE" },
    "Free": { emoji: "", color: "#708090" },
};

// Tạo thanh tiến trình
function createBar(current, max, size = 10) {
    const progress = Math.round((current / max) * size);
    const empty = size - progress;
    return "▰".repeat(progress) + "▱".repeat(empty);
}

// Tính thời gian online đẹp
function formatOnlineTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (mins > 0) parts.push(`${mins} phút`);

    return parts.join(" ") || "0 phút";
}

// Tính thời gian chơi (từ ngày tạo nhân vật đến nay)
function getAccountAge(createTime) {
    const created = moment.unix(createTime);
    const now = moment();
    const days = now.diff(created, "days");

    if (days >= 365) {
        const years = Math.floor(days / 365);
        const remainDays = days % 365;
        return `${years} năm ${remainDays} ngày`;
    }
    if (days >= 30) {
        const months = Math.floor(days / 30);
        const remainDays = days % 30;
        return `${months} tháng ${remainDays} ngày`;
    }
    return `${days} ngày`;
}

// Trạng thái online/offline
function getOnlineStatus(loginTime, logoutTime) {
    if (!loginTime || !logoutTime) return { text: "Không rõ", isOnline: false };
    // Nếu login > logout → đang online
    if (loginTime > logoutTime) {
        return { text: "Đang Online", isOnline: true };
    }
    // Offline → tính last seen
    const lastSeen = moment.unix(logoutTime).tz("Asia/Ho_Chi_Minh");
    const diff = moment().diff(lastSeen, "minutes");
    if (diff < 60) return { text: `Offline · ${diff} phút trước`, isOnline: false };
    if (diff < 1440) return { text: `Offline · ${Math.floor(diff / 60)} giờ trước`, isOnline: false };
    return { text: `Offline · ${lastSeen.format("DD/MM HH:mm")}`, isOnline: false };
}

// Xử lý body type
function getBodyType(type) {
    const types = { 1: "Nam", 0: "Nữ" };
    return types[type] || "Không rõ";
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("player-lookup")
        .setDescription("Tra cứu profile người chơi WWM")
        .addStringOption(option =>
            option.setName("keyword")
                .setDescription("Tên nhân vật hoặc ID")
                .setRequired(true)),
    category: "🎮 Game (WWM)",

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const keyword = interaction.options.getString("keyword").trim();
            let response;
            try {
                response = await axios.get(`${process.env.WWM_LOCAL_API}/id`, {
                    params: { keyword: keyword },
                    timeout: 10000 // 10s timeout
                });
            } catch (err) {
                if (err.code === 'ECONNREFUSED') {
                    await interaction.deleteReply().catch(() => { });
                    return interaction.followUp({ content: `Lỗi: Service tra cứu (Local API) chưa bật.`, ephemeral: true });
                }
                throw err;
            }

            const data = response.data;

            // Xử lý trường hợp không tìm thấy hoặc lỗi
            if (!data || !data.nickname || (data.code !== undefined && data.code !== 0)) {
                await interaction.deleteReply().catch(() => { });
                // Ưu tiên hiển thị msg từ API nếu có
                const errorMsg = data && data.msg ? `Lỗi: ${data.msg}` : `Không tìm thấy người chơi: **${keyword}**`;
                return interaction.followUp({ content: errorMsg, ephemeral: true });
            }

            // === Tính toán dữ liệu ===
            const sectInfo = SECT_INFO[data.school_name] || SECT_INFO["Free"];
            const buildPower = data.max_xiuwei_kungfu ? new Intl.NumberFormat().format(data.max_xiuwei_kungfu) : "0";
            const onlineTime = data.online_time ? formatOnlineTime(data.online_time) : "0 phút";
            const createdDate = data.create_time
                ? moment.unix(data.create_time).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm")
                : "N/A";
            const accountAge = data.create_time ? getAccountAge(data.create_time) : "N/A";
            const status = getOnlineStatus(data.login_time, data.logout_time);
            const body = getBodyType(data.body_type);

            // Level bar (max 100)
            const levelBar = createBar(data.level || 0, 100, 12);
            const levelPercent = data.level || 0;

            // === Build Embed ===
            const displayName = (data.ly_stage_name && data.ly_stage_name !== "")
                ? `${data.nickname} (${data.ly_stage_name})`
                : data.nickname;

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${status.text}`,
                })
                .setTitle(displayName)
                .setColor(status.isOnline ? "#57F287" : sectInfo.color);

            // Description
            const descParts = [];
            if (data.sign && data.sign !== "") {
                descParts.push(`> *"${data.sign}"*`);
            }
            descParts.push(`\`\`\`\nUID: ${data.number_id || "N/A"} · Server: ${data.oversea_tag || "N/A"} · ${data.device_name || "Unknown"}\n\`\`\``);
            embed.setDescription(descParts.join("\n"));

            // Fields
            embed.addFields(
                { name: "Level", value: `**Lv.${levelPercent}** ${levelBar}`, inline: false },
                { name: `Môn Phái`, value: `\`${data.school_name || "Vô Môn"}\``, inline: true },
                { name: "Giới tính", value: `\`${body}\``, inline: true },
                { name: "Build Power", value: `\`${buildPower}\``, inline: true },
                { name: "Điểm Thời Trang", value: `\`${data.fashion_score ? new Intl.NumberFormat().format(data.fashion_score) : "0"}\``, inline: false },
                { name: "Thời gian Online", value: `\`${onlineTime}\``, inline: true },
                { name: "Ngày tạo", value: `\`${createdDate}\`\n(${accountAge})`, inline: true },
                { name: "Tình trạng", value: data.has_disease ? "Đang bị bệnh" : "Khỏe mạnh", inline: true }
            );

            // Sinh nhật từ data._redis_player (hoặc được map sẵn)
            if (data.birthday_month && data.birthday_day) {
                embed.addFields({ name: "Sinh nhật", value: `\`${data.birthday_day}/${data.birthday_month}\``, inline: true });
            }

            // Bang hội từ data._redis_player
            if (data._redis_player?.club) {
                const club = data._redis_player.club;
                const clubName = club.club_name || "Không rõ";
                embed.addFields({ name: "Bang Hội", value: `\`${clubName}\``, inline: true });
            }

            // Social mode
            const socialModes = { 1: "Giao Lưu", 2: "Bình Thường", 3: "Ẩn Danh" };
            const socialText = socialModes[data.social_mode] || "Không rõ";

            // Master status
            const masterText = data.is_master ? `Sư Phụ (${data.students_count || 0} đệ tử)` : "";
            const extraInfo = [socialText, masterText].filter(Boolean).join(" · ");
            if (extraInfo) {
                embed.addFields({ name: "Xã hội", value: extraInfo, inline: false });
            }

            // Footer & Image
            embed.setFooter({
                text: `World of Wuxia Mobile · ${data.oversea_tag || "SEA"} · S${data.server_hostnum || "?"}`,
            });
            embed.setTimestamp();

            if (data.cover_img) {
                embed.setImage(data.cover_img);
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("[Player-Lookup Error]:", error);
            const errMsg = error.response?.status === 404
                ? `Không tìm thấy người chơi: **${interaction.options.getString("keyword")}**`
                : "Đã xảy ra lỗi khi tra cứu. Server có thể đang bảo trì.";
            await interaction.deleteReply().catch(() => { });
            await interaction.followUp({ content: errMsg, ephemeral: true }).catch(() => null);
        }
    },
};
