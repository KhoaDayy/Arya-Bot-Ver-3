const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { GuildWarConfig, GuildWarRegistration } = require('../../db/schemas');
const { getCurrentWeekId, GuildWarScheduler } = require('../../services/guildWar');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guiwar-reset-week')
        .setDescription('[Admin] Đóng Poll tuần hiện tại và tạo Poll báo danh của Tuần mới')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guildId = interaction.guildId;
        const config = await GuildWarConfig.findOne({ guildId });

        if (!config || !config.isActive) {
            return interaction.editReply("❌ Guild War chưa được bật. Vui lòng thử lại.");
        }

        try {
            const guild = await interaction.client.guilds.fetch(guildId);
            const service = new GuildWarScheduler(interaction.client);
            // Đóng bảng Poll hiện tại tránh rác tin nhắn
            if (config.currentPollMessageId) {
                try {
                    await service.archivePoll(guild, config);
                } catch (e) { }
            }

            // Gửi luôn bảng Poll của Tuần này
            await service.sendPoll(guild, config);
            return interaction.editReply("♻️ Đã khởi chạy lại Tuần Mới! Một bảng báo danh mới đã được ghim thay thế Poll cũ.");
        } catch (error) {
            console.error('[reset-week] Lỗi:', error);
            return interaction.editReply("❌ Đã xảy ra lỗi khi tạo tuẩn mới.");
        }
    }
};
