const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { GuildWarConfig } = require('../../db/schemas');
const { GuildWarScheduler } = require('../../services/guildWar');
const { isOwner } = require('../../utils/guards');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guiwar-force-start')
        .setDescription('[Admin] Ép mở poll đăng ký Guild War ngay lập tức (Bỏ qua lịch trình cron)'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!isOwner(interaction.user.id) && !interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.editReply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        const guildId = interaction.guildId;
        const config = await GuildWarConfig.findOne({ guildId });

        if (!config || !config.isActive) {
            return interaction.editReply("❌ Guild War chưa được cấu hình. Vui lòng dùng lệnh `/guiwar-setup` trước.");
        }

        try {
            const guild = await interaction.client.guilds.fetch(guildId);
            const service = new GuildWarScheduler(interaction.client);
            await service.sendPoll(guild, config);
            return interaction.editReply("✅ Đã tạo bảng Poll báo danh Guild War thành công!");
        } catch (error) {
            console.error('[force-start] Lỗi:', error);
            return interaction.editReply("❌ Đã xảy ra lỗi khi tạo bảng Poll. Hãy kiểm tra lại cấu hình hoặc quyền của Bot.");
        }
    }
};
