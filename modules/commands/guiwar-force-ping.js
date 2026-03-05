const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { GuildWarConfig } = require('../../db/schemas');
const { GuildWarScheduler } = require('../../services/guildWar');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guiwar-force-ping')
        .setDescription('[Admin] Cưỡng ép gửi thông báo nhắc nhở Guild War ngay lập tức')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guildId = interaction.guildId;
        const config = await GuildWarConfig.findOne({ guildId });

        if (!config || !config.isActive) {
            return interaction.editReply("❌ Guild War chưa được cấu hình. Vui lòng dùng lệnh `/guiwar-setup` trước.");
        }

        try {
            const ContainerBuilder = require('discord.js').ContainerBuilder;
            const TextDisplayBuilder = require('discord.js').TextDisplayBuilder;
            const guild = await interaction.client.guilds.fetch(guildId);
            const channel = guild.channels.cache.get(config.channelId) || await guild.channels.fetch(config.channelId).catch(() => null);

            if (!channel) return interaction.editReply("❌ Không tìm thấy kênh thông báo đã cài đặt.");

            const roleT7 = config.roleT7 ? `<@&${config.roleT7}>` : '';
            const roleCN = config.roleCN ? `<@&${config.roleCN}>` : '';
            const mentions = [roleT7, roleCN].filter(Boolean).join(' ') || '@everyone';

            const container = new ContainerBuilder()
                .setAccentColor(0xE74C3C)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `## 🚨 [PING KHẨN CẤP] GUILD WAR\n` +
                        `${mentions}\n` +
                        `> Admin vừa reo vang tù và gọi thư tập kết!\n` +
                        `> Vui lòng online vào game **ngay bây giờ**, tập kết và Join Voice!\n` +
                        `> Chúc anh em đánh war thành công rực rỡ! 💪`
                    )
                );

            await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return interaction.editReply("✅ Đã gửi Ping thông báo Guild War khẩn cấp vào kênh!");
        } catch (error) {
            console.error('[force-ping] Lỗi:', error);
            return interaction.editReply("❌ Có lỗi xảy ra. Hãy kiểm tra lại Bot có quyền chat trong kênh thông báo chưa.");
        }
    }
};
