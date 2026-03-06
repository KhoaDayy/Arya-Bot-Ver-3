const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { GuildWarConfig } = require('../../db/schemas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guildwar-setup')
        .setDescription('Thiết lập hệ thống đăng ký và nhắc lịch Guild War tự động.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        // ─── Required ───────────────────────────────────────────────────────
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Kênh sẽ gửi bảng đăng ký (Poll) hàng tuần')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        // ─── Optional: Roles ────────────────────────────────────────────────
        .addRoleOption(option =>
            option.setName('role_t7')
                .setDescription('Role cấp cho người tham gia Thứ 7 (để trống = tự tạo)')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role_cn')
                .setDescription('Role cấp cho người tham gia Chủ Nhật (để trống = tự tạo)')
                .setRequired(false))
        // ─── Optional: Timing ───────────────────────────────────────────────
        .addStringOption(option =>
            option.setName('poll_time')
                .setDescription('Giờ gửi Poll vào Thứ 6 (VD: 19:00)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('time_t7')
                .setDescription('Giờ Ping War Thứ 7 (VD: 19:00)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('time_cn')
                .setDescription('Giờ Ping War Chủ Nhật (VD: 19:00)')
                .setRequired(false))
        // ─── Optional: Advanced ─────────────────────────────────────────────
        .addStringOption(option =>
            option.setName('reminders')
                .setDescription('Nhắc trước mấy phút? Nhập các số cách nhau bằng dấu phẩy (VD: 30,15,5)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('signup_deadline')
                .setDescription('Giờ đóng đăng ký vào Chủ Nhật (VD: 20:00). Mặc định: 20:00')
                .setRequired(false)),
    category: "⚙️ Setup",

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.options.getChannel('channel');
            const roleT7 = interaction.options.getRole('role_t7');
            const roleCN = interaction.options.getRole('role_cn');
            const pollTime = interaction.options.getString('poll_time') || "19:00";
            const timeT7 = interaction.options.getString('time_t7') || "19:00";
            const timeCN = interaction.options.getString('time_cn') || "19:00";
            const remindersRaw = interaction.options.getString('reminders');
            const signupDeadlineRaw = interaction.options.getString('signup_deadline') ?? '20:00';

            // Validate time format (HH:mm)
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

            // Validate deadline time format
            const signupDeadline = timeRegex.test(signupDeadlineRaw) ? signupDeadlineRaw : '20:00';

            if (!timeRegex.test(pollTime) || !timeRegex.test(timeT7) || !timeRegex.test(timeCN)) {
                return interaction.editReply("❌ Định dạng giờ không hợp lệ. Dùng định dạng HH:mm (VD: 19:00).");
            }

            // Parse reminder offsets
            let reminderOffsets = [30, 15, 5]; // Default
            if (remindersRaw) {
                const parsed = remindersRaw.split(',')
                    .map(s => parseInt(s.trim(), 10))
                    .filter(n => !isNaN(n) && n > 0 && n <= 120);
                if (parsed.length === 0) {
                    return interaction.editReply("❌ Định dạng reminders không hợp lệ. VD: `30,15,5`");
                }
                reminderOffsets = [...new Set(parsed)].sort((a, b) => b - a);
            }

            // Upsert MongoDB
            await GuildWarConfig.findOneAndUpdate(
                { guildId: interaction.guildId },
                {
                    channelId: channel.id,
                    roleT7: roleT7?.id ?? null,
                    roleCN: roleCN?.id ?? null,
                    pollDay: 5,
                    pollTime,
                    timeT7,
                    timeCN,
                    reminderOffsets,
                    signupDeadline,
                    isActive: true
                },
                { upsert: true, new: true }
            );

            const reminderStr = reminderOffsets.map(m => `${m}p`).join(', ');

            const embed = new EmbedBuilder()
                .setTitle("✅ Thiết Lập Guild War Thành Công!")
                .setColor("#57F287")
                .setDescription("Hệ thống sẽ tự động hoạt động theo cấu hình:")
                .addFields(
                    { name: '📍 Kênh Thông Báo', value: `<#${channel.id}>`, inline: true },
                    { name: '🕘 Gửi Poll (Thứ 6)', value: `\`${pollTime}\``, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '⚔️ Role Thứ 7', value: roleT7 ? `<@&${roleT7.id}>` : '*Tự động tạo*', inline: true },
                    { name: '⏰ Giờ Ping T7', value: `\`${timeT7}\``, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '⚔️ Role Chủ Nhật', value: roleCN ? `<@&${roleCN.id}>` : '*Tự động tạo*', inline: true },
                    { name: '⏰ Giờ Ping CN', value: `\`${timeCN}\``, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '🔔 Nhắc Trước', value: reminderStr, inline: true },
                    { name: '🔴 Đóng Đăng Ký (CN)', value: `\`${signupDeadline}\``, inline: true },
                )
                .setFooter({ text: "Cron job chạy mỗi phút · Thay đổi cũng có thể chỉnh qua Web Dashboard" });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("[GuiWarSetup Error]:", error);
            await interaction.editReply("❌ Lỗi khi lưu vào Database.");
        }
    }
};
