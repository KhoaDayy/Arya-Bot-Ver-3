const { EventEmitter } = require('events');
const {
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags,
    ChannelType,
} = require('discord.js');

const { getCurrentWeekId, now } = require('./helpers');
const { buildPollPayload, buildPingPayload, buildReminderPayload } = require('./builders');
const { configCache } = require('./cache');
const { roleService } = require('./RoleProvisionService');
const { GuildWarScheduler } = require('./GuildWarScheduler');
const { GuildWarConfig, GuildWarRegistration } = require('../../db/schemas');

/**
 * Core Guild War Service — extends EventEmitter.
 *
 * Events:
 *   poll_sent      { guild, config, messageId }
 *   reminder_sent  { guild, config, day, offsetMinutes }
 *   war_started    { guild, config, day }
 *   voice_created  { guild, config, day, channelId }
 *   voice_cleaned  { guild, config, day, channelId }
 *   roles_cleaned  { guild, config, day }
 *   poll_archived  { guild, config, weekId }
 *   signup_closed  { guild, config }
 */
class GuildWarService extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.scheduler = new GuildWarScheduler(this);
    }

    startCron() {
        this.scheduler.start();
    }

    // ─── Actions ───────────────────────────────────────────────────────────

    async sendPoll(guild, config) {
        try {
            const channel = guild.channels.cache.get(config.channelId)
                || await guild.channels.fetch(config.channelId).catch((err) => {
                    console.error(`[GuildWar] ❌ Không thể fetch channel ${config.channelId} trong ${guild.name}: ${err.message}`);
                    return null;
                });
            if (!channel) {
                console.warn(`[GuildWar] ⚠️ Channel ${config.channelId} không tìm thấy trong ${guild.name} (${guild.id}) — bỏ qua gửi poll.`);
                return;
            }

            const weekId = getCurrentWeekId();
            const payload = buildPollPayload(weekId, config);
            const msg = await channel.send(payload);

            await GuildWarConfig.updateOne(
                { guildId: guild.id },
                { currentPollMessageId: msg.id, currentPollChannelId: channel.id }
            );
            configCache.invalidate();

            console.log(`[GuildWar] Poll sent → ${guild.name} (${guild.id}) msg ${msg.id}`);
            this.emit('poll_sent', { guild, config, messageId: msg.id });
        } catch (e) {
            console.error(`[GuildWar] sendPoll failed ${guild.name} (${guild.id}):`, e);
        }
    }

    async bumpPoll(guild, config) {
        try {
            if (!config.currentPollChannelId) {
                console.warn(`[GuildWar] Bỏ qua bump poll vì không có channel lưu trong config: ${guild.name}`);
                return false;
            }

            const channel = guild.channels.cache.get(config.currentPollChannelId)
                || await guild.channels.fetch(config.currentPollChannelId).catch(() => null);
            if (!channel) return false;

            if (config.currentPollMessageId) {
                const oldMsg = await channel.messages.fetch(config.currentPollMessageId).catch(() => null);
                if (oldMsg) {
                    await oldMsg.delete().catch(() => null);
                }
            }

            const weekId = getCurrentWeekId();
            const regs = await GuildWarRegistration.find({ guildId: guild.id, weekId, 'days.0': { $exists: true } });
            const counts = {
                t7: regs.filter(r => r.days.includes('T7')).length,
                cn: regs.filter(r => r.days.includes('CN')).length,
                all: regs.filter(r => r.days.includes('T7') && r.days.includes('CN')).length,
            };

            const payload = buildPollPayload(weekId, config, counts);
            const msg = await channel.send(payload);

            await GuildWarConfig.updateOne(
                { guildId: guild.id },
                { currentPollMessageId: msg.id }
            );
            configCache.invalidate();

            console.log(`[GuildWar] Poll bumped → ${guild.name} (${guild.id}) msg ${msg.id}`);
            return true;
        } catch (e) {
            console.error(`[GuildWar] bumpPoll failed ${guild.name} (${guild.id}):`, e);
            return false;
        }
    }

    async sendReminder(guild, config, dayStr, offsetMinutes) {
        try {
            const channel = guild.channels.cache.get(config.channelId)
                || await guild.channels.fetch(config.channelId).catch(() => null);
            if (!channel) return;

            const roleId = dayStr === 'T7' ? config.roleT7 : config.roleCN;
            await channel.send(buildReminderPayload(dayStr, offsetMinutes, roleId, config));

            this.emit('reminder_sent', { guild, config, day: dayStr, offsetMinutes });
        } catch (e) {
            console.error(`[GuildWar] sendReminder failed ${guild.name} (${guild.id}):`, e);
        }
    }

    async createVoiceChannel(guild, config, dayStr) {
        try {
            if (!config.voiceCategory || !config.voiceNameTemplate) return;

            let vcName = config.voiceNameTemplate;
            if (vcName.includes('{day}')) {
                vcName = vcName.replace('{day}', dayStr === 'T7' ? 'Thứ 7' : 'Chủ Nhật');
            } else {
                vcName = `${vcName} ${dayStr === 'T7' ? 'T7' : 'CN'}`;
            }

            const vc = await guild.channels.create({
                name: vcName,
                type: ChannelType.GuildVoice,
                parent: config.voiceCategory,
                reason: 'Tự động tạo phòng voice đánh Lãnh Địa Chiến',
            });
            console.log(`[GuildWar] Auto-created Voice Channel: ${vc.name} in ${guild.name}`);

            if (dayStr === 'T7') config.voiceChannelT7Id = vc.id;
            else config.voiceChannelCNId = vc.id;
            await config.save();
            configCache.invalidate();

            // Post thông báo VC đã mở
            const channel = guild.channels.cache.get(config.channelId);
            if (channel) {
                const roleId = dayStr === 'T7' ? config.roleT7 : config.roleCN;
                channel.send({
                    content: roleId ? `<@&${roleId}>` : '',
                    components: [
                        new ContainerBuilder()
                            .setAccentColor(0x3498db)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `🔊 **Đã mở Kênh Voice:** <#${vc.id}>\n` +
                                    `*Hãy tham gia để chuẩn bị tập trung cho trận chiến sắp tới nhé!*`
                                )
                            )
                    ],
                    flags: MessageFlags.IsComponentsV2,
                }).catch(() => null);
            }

            this.emit('voice_created', { guild, config, day: dayStr, channelId: vc.id });
        } catch (e) {
            console.error(`[GuildWar] createVoiceChannel failed ${guild.name} (${guild.id}):`, e);
        }
    }

    async checkAndCleanupVoice(guild, config, dayStr) {
        const vcId = dayStr === 'T7' ? config.voiceChannelT7Id : config.voiceChannelCNId;
        if (!vcId) return;

        try {
            const currentNow = now();
            const currentDay = currentNow.day();
            const targetDay = dayStr === 'T7' ? 6 : 0;
            const isAfter10PM = currentDay === targetDay && currentNow.hour() >= 22;
            const isNextDay = currentDay !== targetDay;

            if (isAfter10PM || isNextDay) {
                const vc = guild.channels.cache.get(vcId)
                    || await guild.channels.fetch(vcId).catch(() => null);

                if (!vc) {
                    if (dayStr === 'T7') config.voiceChannelT7Id = null;
                    else config.voiceChannelCNId = null;
                    await config.save();
                    configCache.invalidate();
                    return;
                }

                if (vc.members.size === 0) {
                    await vc.delete('Hết Lãnh Địa Chiến');
                    if (dayStr === 'T7') config.voiceChannelT7Id = null;
                    else config.voiceChannelCNId = null;
                    await config.save();
                    configCache.invalidate();
                    console.log(`[GuildWar] Cleaned up Voice Channel ${vcId} for ${dayStr}`);
                    this.emit('voice_cleaned', { guild, config, day: dayStr, channelId: vcId });
                }
            }
        } catch (e) {
            console.error(`[GuildWar] checkAndCleanupVoice failed ${guild.name} (${guild.id}):`, e);
        }
    }

    async pingWar(guild, config, dayStr) {
        try {
            const channel = guild.channels.cache.get(config.channelId)
                || await guild.channels.fetch(config.channelId).catch(() => null);
            if (!channel) return;

            const role = await roleService.ensureRole(guild, config, dayStr);
            await channel.send(buildPingPayload(dayStr, role.id, config));

            this.emit('war_started', { guild, config, day: dayStr });
        } catch (e) {
            console.error(`[GuildWar] pingWar failed ${guild.name} (${guild.id}):`, e);
        }
    }

    async cleanupRoles(guild, config, dayStr) {
        try {
            const roleId = dayStr === 'T7' ? config.roleT7 : config.roleCN;
            if (!roleId) return;

            const role = guild.roles.cache.get(roleId)
                || await guild.roles.fetch(roleId).catch(() => null);
            if (!role) return;

            for (const [, member] of role.members) {
                await member.roles.remove(role).catch(() => { });
            }

            const ch = guild.channels.cache.get(config.channelId);
            if (ch) {
                ch.send({
                    content: '',
                    components: [
                        new ContainerBuilder()
                            .setAccentColor(0x2ECC71)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `*✅ Guild War kết thúc — role \`${role.name}\` đã được thu hồi.*`
                                )
                            )
                    ],
                    flags: MessageFlags.IsComponentsV2,
                }).catch(() => null);
            }

            this.emit('roles_cleaned', { guild, config, day: dayStr });
        } catch (e) {
            console.error(`[GuildWar] cleanupRoles failed ${guild.name} (${guild.id}):`, e);
        }
    }

    async archivePoll(guild, config) {
        try {
            if (!config.currentPollMessageId || !config.currentPollChannelId) return;

            const channel = guild.channels.cache.get(config.currentPollChannelId)
                || await guild.channels.fetch(config.currentPollChannelId).catch(() => null);
            if (!channel) return;

            const message = await channel.messages.fetch(config.currentPollMessageId).catch(() => null);
            if (!message) {
                console.warn(`[GuildWar] Archive poll warning: Message ${config.currentPollMessageId} not found in ${guild.name}. Admin might have deleted it.`);
                return;
            }

            const weekId = getCurrentWeekId();
            const regs = await GuildWarRegistration.find({ guildId: guild.id, weekId, 'days.0': { $exists: true } });
            const counts = {
                t7: regs.filter(r => r.days.includes('T7')).length,
                cn: regs.filter(r => r.days.includes('CN')).length,
                all: regs.filter(r => r.days.includes('T7') && r.days.includes('CN')).length,
            };

            const payload = buildPollPayload(weekId, config, counts, { archived: true });
            await message.edit(payload);

            await GuildWarConfig.updateOne(
                { guildId: guild.id },
                { currentPollMessageId: null, currentPollChannelId: null }
            );
            configCache.invalidate();

            this.emit('poll_archived', { guild, config, weekId });
        } catch (e) {
            console.error(`[GuildWar] archivePoll failed ${guild.name} (${guild.id}):`, e);
        }
    }

    /** Cập nhật trạng thái nút poll (disable một phần hoặc toàn bộ) */
    async updatePollButtons(guild, config, opts = {}) {
        try {
            if (!config.currentPollMessageId || !config.currentPollChannelId) return;

            const channel = guild.channels.cache.get(config.currentPollChannelId)
                || await guild.channels.fetch(config.currentPollChannelId).catch(() => null);
            if (!channel) return;

            const message = await channel.messages.fetch(config.currentPollMessageId).catch(() => null);
            if (!message) return;

            const weekId = getCurrentWeekId();
            const regs = await GuildWarRegistration.find({ guildId: guild.id, weekId, 'days.0': { $exists: true } });
            const counts = {
                t7: regs.filter(r => r.days.includes('T7')).length,
                cn: regs.filter(r => r.days.includes('CN')).length,
                all: regs.filter(r => r.days.includes('T7') && r.days.includes('CN')).length,
            };

            const payload = buildPollPayload(weekId, config, counts, opts);
            await message.edit(payload);
        } catch (e) {
            console.error(`[GuildWar] updatePollButtons failed ${guild.name} (${guild.id}):`, e);
        }
    }

    /** Đóng đăng ký (deadline) */
    async closeSignup(guild, config) {
        try {
            await this.updatePollButtons(guild, config, { disabled: true });
            const ch = guild.channels.cache.get(config.channelId);
            if (ch) {
                ch.send({
                    content: '',
                    components: [
                        new ContainerBuilder()
                            .setAccentColor(0x95a5a6)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `## 🔒 Đăng ký đã đóng\n` +
                                    `-# Thời hạn đăng ký \`${config.signupDeadline}\` Chủ Nhật đã qua. Admin dùng \`/guiwar-admin list\` để xem danh sách.`
                                )
                            )
                    ],
                    flags: MessageFlags.IsComponentsV2,
                }).catch(() => null);
            }
            this.emit('signup_closed', { guild, config });
        } catch (e) {
            console.error(`[GuildWar] closeSignup failed ${guild.name} (${guild.id}):`, e);
        }
    }
}

module.exports = { GuildWarService };
