const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { GuildWarConfig } = require('../../db/schemas');
const { GuildWarService } = require('../../services/guildWar');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guiwar-force-voice')
        .setDescription('[Admin] Test tạo/xoá Voice Channel cho Guild War')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(opt =>
            opt.setName('action')
                .setDescription('Hành động muốn thực hiện')
                .setRequired(true)
                .addChoices(
                    { name: '🔊 Tạo Voice T7', value: 'create_t7' },
                    { name: '🔊 Tạo Voice CN', value: 'create_cn' },
                    { name: '🗑️ Xoá Voice T7', value: 'delete_t7' },
                    { name: '🗑️ Xoá Voice CN', value: 'delete_cn' },
                    { name: '📋 Xem trạng thái', value: 'status' },
                )),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guildId = interaction.guildId;
        const config = await GuildWarConfig.findOne({ guildId });

        if (!config || !config.isActive) {
            return interaction.editReply("❌ Guild War chưa được cấu hình. Vui lòng dùng `/guiwar-setup` trước.");
        }

        const action = interaction.options.getString('action');
        const guild = interaction.guild;
        const gw = new GuildWarService(interaction.client);

        try {
            if (action === 'status') {
                const t7vc = config.voiceChannelT7Id
                    ? (guild.channels.cache.get(config.voiceChannelT7Id) || '❌ ID lưu nhưng channel đã bị xoá')
                    : null;
                const cnvc = config.voiceChannelCNId
                    ? (guild.channels.cache.get(config.voiceChannelCNId) || '❌ ID lưu nhưng channel đã bị xoá')
                    : null;

                return interaction.editReply(
                    `📋 **Trạng thái Voice Channels**\n` +
                    `> **Category:** ${config.voiceCategory ? `<#${config.voiceCategory}>` : '⚠️ Chưa set'}\n` +
                    `> **Template:** \`${config.voiceNameTemplate || '(chưa set)'}\`\n` +
                    `> **Voice T7:** ${t7vc ? (typeof t7vc === 'string' ? t7vc : `<#${t7vc.id}> (${t7vc.members.size} người)`) : '— chưa tạo'}\n` +
                    `> **Voice CN:** ${cnvc ? (typeof cnvc === 'string' ? cnvc : `<#${cnvc.id}> (${cnvc.members.size} người)`) : '— chưa tạo'}`
                );
            }

            if (action === 'create_t7' || action === 'create_cn') {
                const dayStr = action === 'create_t7' ? 'T7' : 'CN';
                const existingId = dayStr === 'T7' ? config.voiceChannelT7Id : config.voiceChannelCNId;

                if (existingId) {
                    const existing = guild.channels.cache.get(existingId);
                    if (existing) {
                        return interaction.editReply(`⚠️ Voice ${dayStr} đã tồn tại: <#${existingId}>. Xoá trước rồi tạo lại.`);
                    }
                }

                if (!config.voiceCategory || !config.voiceNameTemplate) {
                    return interaction.editReply(
                        "⚠️ Chưa cấu hình `voiceCategory` hoặc `voiceNameTemplate` trong dashboard.\n" +
                        "Vào Dashboard → Guild War Settings để set."
                    );
                }

                // Gọi trực tiếp method createVoiceChannel
                await gw.createVoiceChannel(guild, config, dayStr);

                // Re-fetch config để lấy VC ID mới
                const updated = await GuildWarConfig.findOne({ guildId });
                const newVcId = dayStr === 'T7' ? updated?.voiceChannelT7Id : updated?.voiceChannelCNId;

                if (newVcId) {
                    return interaction.editReply(`✅ Đã tạo Voice Channel ${dayStr}: <#${newVcId}>`);
                } else {
                    return interaction.editReply("❌ Tạo thất bại — kiểm tra log console của bot.");
                }
            }

            if (action === 'delete_t7' || action === 'delete_cn') {
                const dayStr = action === 'delete_t7' ? 'T7' : 'CN';
                const vcId = dayStr === 'T7' ? config.voiceChannelT7Id : config.voiceChannelCNId;

                if (!vcId) {
                    return interaction.editReply(`ℹ️ Không có Voice Channel ${dayStr} nào đang active.`);
                }

                const vc = guild.channels.cache.get(vcId) || await guild.channels.fetch(vcId).catch(() => null);
                if (vc) {
                    await vc.delete(`[Admin] Force delete voice ${dayStr}`);
                }

                if (dayStr === 'T7') config.voiceChannelT7Id = null;
                else config.voiceChannelCNId = null;
                await config.save();

                return interaction.editReply(`🗑️ Đã xoá Voice Channel ${dayStr}${vc ? ` (${vc.name})` : ' (đã clean DB)'}.`);
            }
        } catch (error) {
            console.error('[guiwar-force-voice] Error:', error);
            return interaction.editReply(`❌ Lỗi: ${error.message}`);
        }
    }
};
