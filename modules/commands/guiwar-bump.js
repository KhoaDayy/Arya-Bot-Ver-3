const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { GuildWarConfig } = require('../../db/schemas');
const { GuildWarScheduler } = require('../../services/guildWar');
const { isOwner } = require('../../utils/guards');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guiwar-bump')
        .setDescription('[Admin] Bump tin nhắn Poll lên đầu chat (giữ nguyên vote)'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!isOwner(interaction.user.id) && !interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.editReply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        const guildId = interaction.guildId;
        const config = await GuildWarConfig.findOne({ guildId });

        if (!config || !config.isActive) {
            return interaction.editReply('❌ Guild War chưa được cấu hình. Vui lòng dùng lệnh `/guiwar-setup` trước.');
        }

        if (!config.currentPollMessageId) {
            return interaction.editReply('❌ Hiện tại không có poll nào đang hoạt động. Dùng `/guiwar-force-start` để tạo poll mới.');
        }

        try {
            const guild = await interaction.client.guilds.fetch(guildId);
            const service = new GuildWarScheduler(interaction.client);
            const success = await service.bumpPoll(guild, config);

            if (success) {
                return interaction.editReply('✅ Đã bump tin nhắn Poll lên đầu chat! Tất cả vote trước đó vẫn được giữ nguyên.');
            } else {
                return interaction.editReply('❌ Không thể bump poll. Kiểm tra lại channel hoặc quyền của Bot.');
            }
        } catch (error) {
            console.error('[guiwar-bump] Lỗi:', error);
            return interaction.editReply('❌ Đã xảy ra lỗi khi bump poll.');
        }
    }
};
