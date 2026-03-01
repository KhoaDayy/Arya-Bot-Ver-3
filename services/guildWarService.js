const cron = require('node-cron');
const moment = require('moment-timezone');
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    MessageFlags,
    ChannelType,
} = require('discord.js');
const { GuildWarConfig, GuildWarRegistration, GuildWarStats, GuildWarMember } = require('../db/schemas');

// ─── Game Assets ─────────────────────────────────────────────────────────────
// Banner: Steam header của game Guild War
const BANNER_URL = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3564740/6d94b048393d5358690a04a7db99f2c9739c703c/header.jpg?t=1763157550';
// Logo: Icon của game
const LOGO_URL = 'https://tse1.mm.bing.net/th/id/OIP.VXSaOQy7W7n5kI9FmkK0RAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3';

// Custom emojis của server
const E = {
    calendar: { name: 'calendar', id: '1477352232205947084' },
    close: { name: 'close', id: '1477352230234620066' },
    saturday: { name: 'saturday', id: '1477352228305244390' },
    sunday: { name: 'sunday', id: '1477352226904346812' },
    announcement: { name: 'announcement', id: '1477352822243725382' },
    useraccount: { name: 'useraccount', id: '1477352820666536016' },
};
// Format để dùng trong text content
const EM = {
    calendar: `<:calendar:1477352232205947084>`,
    saturday: `<:saturday:1477352228305244390>`,
    sunday: `<:sunday:1477352226904346812>`,
    announcement: `<:announcement:1477352822243725382>`,
    useraccount: `<:useraccount:1477352820666536016>`,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentWeekId() {
    // Dùng ISO week (GGGG-WW) thay vì locale week (gggg-ww)
    // ISO week bắt đầu từ Thứ 2 → T7 và CN luôn cùng tuần
    return moment().tz("Asia/Ho_Chi_Minh").format("GGGG-[W]WW");
}

function subtractMinutes(timeStr, minutes) {
    return moment.tz(timeStr, "HH:mm", "Asia/Ho_Chi_Minh")
        .subtract(minutes, 'minutes')
        .format("HH:mm");
}

const _buttonCooldowns = new Map();
function isButtonSpam(userId) {
    const now = Date.now();
    const last = _buttonCooldowns.get(userId) || 0;
    if (now - last < 3000) return true;
    _buttonCooldowns.set(userId, now);
    return false;
}

// ─── Components V2 Builders ───────────────────────────────────────────────────

/** Build 4 poll buttons */
function buildPollButtons(weekId, { disableT7 = false, disableCN = false, disabled = false } = {}) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`guiwar_btn_T7_${weekId}`)
            .setLabel("Thứ 7")
            .setEmoji(E.saturday)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled || disableT7),
        new ButtonBuilder()
            .setCustomId(`guiwar_btn_CN_${weekId}`)
            .setLabel("Chủ Nhật")
            .setEmoji(E.sunday)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled || disableCN),
        new ButtonBuilder()
            .setCustomId(`guiwar_btn_ALL_${weekId}`)
            .setLabel("🌟 Cả 2 Ngày")
            .setStyle(ButtonStyle.Success)
            .setDisabled(disabled || disableT7 || disableCN),
        new ButtonBuilder()
            .setCustomId(`guiwar_btn_CANCEL_${weekId}`)
            .setLabel("Hủy")
            .setEmoji(E.close)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(disabled)
    );
}

/**
 * Build the full poll container (Components V2)
 * @param {string} weekId
 * @param {object} config - GuildWarConfig document
 * @param {{ t7: number, cn: number, all: number }} counts
 * @param {{ archived?: boolean, disableT7?: boolean, disableCN?: boolean, disabled?: boolean }} opts
 * @returns {{ components: ContainerBuilder[], flags: number }} - ready to spread into send/edit
 */
function buildPollPayload(weekId, config, counts = { t7: 0, cn: 0, all: 0 }, opts = {}) {
    const { archived = false, disableT7 = false, disableCN = false, disabled = false } = opts;
    const weekNum = weekId.split('-W')[1];

    const deadlineNote = (!archived && config.signupDeadline)
        ? `\n-# 🔒 Đóng đăng ký lúc **${config.signupDeadline}** Chủ Nhật`
        : '';

    const accentColor = archived ? 0x7f8c8d : 0x5865F2;

    const container = new ContainerBuilder().setAccentColor(accentColor);

    if (!archived) {
        // ── Banner ────────────────────────────────────────────────────
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(BANNER_URL)
            )
        );

        // ── Tiêu đề + Lịch đánh ───────────────────────────────────────
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ${EM.announcement} Báo Danh Guild War — Tuần ${weekNum}\n` +
                `${EM.saturday} **Thứ 7** \`${config.timeT7}\`　　${EM.sunday} **Chủ Nhật** \`${config.timeCN}\`` +
                (config.signupDeadline ? `\n-# 🔒 Đăng ký đóng lúc ${config.signupDeadline} Chủ Nhật` : '')
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setDivider(true));

        // ── Stats + Buttons ───────────────────────────────────────────
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `${EM.useraccount} **Đã báo danh:** ` +
                `${EM.saturday} T7 **${counts.t7}**　|　${EM.sunday} CN **${counts.cn}**　|　🌟 Cả 2 **${counts.all}**`
            )
        );
        container.addActionRowComponents(
            buildPollButtons(weekId, { disableT7, disableCN, disabled })
        );

    } else {
        // ── Archived ─────────────────────────────────────────────
        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `## ✅ [ĐÃ KẾT THÚC] Báo Danh War — Tuần ${weekNum}`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(LOGO_URL)
                        .setDescription('Guild War Logo')
                )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `📊 **Kết quả cuối tuần**\n` +
                `Thứ 7: **${counts.t7}** người  ·  Chủ Nhật: **${counts.cn}** người  ·  Cả 2: **${counts.all}** người\n` +
                `-# Tuần ${weekId} · Đã kết thúc`
            )
        );
    }

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    };
}


/** Build ping war container */
function buildPingPayload(dayStr, roleId) {
    const mention = roleId ? `<@&${roleId}>` : '@everyone';
    const dayLabel = dayStr === "T7" ? "Thứ 7 (Saturday)" : "Chủ Nhật (Sunday)";

    const container = new ContainerBuilder()
        .setAccentColor(0xE74C3C)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🚨 ĐẾN GIỜ WAR RỒI ANH EM!\n### ${dayLabel}\n` +
                `${mention}\n` +
                `> Vui lòng online vào game **ngay bây giờ**, tập kết và Join Voice!\n` +
                `> Chúc party đánh war thành công rực rỡ! 💪`
            )
        );

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    };
}

/** Build reminder container */
function buildReminderPayload(dayStr, offsetMinutes, roleId) {
    const mention = roleId ? `<@&${roleId}>` : '@everyone';
    const dayLabel = dayStr === "T7" ? "Thứ 7" : "Chủ Nhật";

    const container = new ContainerBuilder()
        .setAccentColor(0xF39C12)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ⏰ Còn ${offsetMinutes} phút — Guild War ${dayLabel}!\n` +
                `${mention} Chuẩn bị vào game và Join Voice nhé!`
            )
        );

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    };
}

// ─── Stats ───────────────────────────────────────────────────────────────────

async function updatePlayerStats(guildId, userId, days, weekId) {
    try {
        const prevWeekId = moment.tz("Asia/Ho_Chi_Minh").subtract(1, 'week').format("GGGG-[W]WW");

        let stats = await GuildWarStats.findOne({ guildId, userId });
        if (!stats) {
            stats = new GuildWarStats({ guildId, userId, totalWars: 0, consecutiveWeeks: 0, lastParticipatedWeek: "" });
        }

        if (days.length > 0) {
            if (stats.lastParticipatedWeek !== weekId) {
                stats.totalWars += 1;
                stats.consecutiveWeeks = stats.lastParticipatedWeek === prevWeekId
                    ? stats.consecutiveWeeks + 1
                    : 1;
                stats.lastParticipatedWeek = weekId;
            }
        } else {
            if (stats.lastParticipatedWeek === weekId && stats.totalWars > 0) {
                stats.totalWars -= 1;
                stats.lastParticipatedWeek = "";
                if (stats.consecutiveWeeks > 0) stats.consecutiveWeeks -= 1;
            }
        }
        await stats.save();
    } catch (e) {
        console.error("[GuildWar] updatePlayerStats error:", e);
    }
}

// ─── GuildWarService ──────────────────────────────────────────────────────────

class GuildWarService {
    constructor(client) {
        this.client = client;
        this._cachedConfigs = [];
        this._lastCacheRefresh = 0;
    }

    /** Lấy configs từ cache, refresh mỗi 5 phút */
    async _getConfigs() {
        const now = Date.now();
        if (now - this._lastCacheRefresh > 5 * 60_000 || this._cachedConfigs.length === 0) {
            this._cachedConfigs = await GuildWarConfig.find({ isActive: true });
            this._lastCacheRefresh = now;
        }
        return this._cachedConfigs;
    }

    /** Force refresh cache (gọi sau khi config thay đổi) */
    invalidateCache() {
        this._lastCacheRefresh = 0;
    }

    startCron() {
        console.log("🕒 Starting GuildWar Cron Job...");
        cron.schedule('* * * * *', async () => {
            const now = moment().tz("Asia/Ho_Chi_Minh");
            const currentDay = now.day(); // 0=CN, 5=T6, 6=T7
            const currentTime = now.format("HH:mm");

            try {
                const configs = await this._getConfigs();

                for (const config of configs) {
                    const guild = this.client.guilds.cache.get(config.guildId);
                    if (!guild) continue;

                    // 1. Gửi Poll (Thứ 6)
                    if (currentDay === config.pollDay && currentTime === config.pollTime) {
                        await this.sendPoll(guild, config);
                    }

                    // 2 & 3. Reminders T7 / CN and First Ping Voice Creation
                    const offsets = config.reminderOffsets || [];
                    const maxOffset = offsets.length > 0 ? Math.max(...offsets) : -1;
                    for (const offset of offsets) {
                        if (currentDay === 6 && currentTime === subtractMinutes(config.timeT7, offset)) {
                            await this.sendReminder(guild, config, "T7", offset);
                            if (offset === maxOffset) await this.createVoiceChannel(guild, config, "T7");
                        }
                        if (currentDay === 0 && currentTime === subtractMinutes(config.timeCN, offset)) {
                            await this.sendReminder(guild, config, "CN", offset);
                            if (offset === maxOffset) await this.createVoiceChannel(guild, config, "CN");
                        }
                    }

                    // 3.5 Cleanup Voice after 22:00
                    if (config.voiceChannelT7Id) await this.checkAndCleanupVoice(guild, config, "T7");
                    if (config.voiceChannelCNId) await this.checkAndCleanupVoice(guild, config, "CN");

                    // 4. Ping War T7 + disable T7/ALL nút
                    if (currentDay === 6 && currentTime === config.timeT7) {
                        await this.pingWar(guild, config, "T7");
                        await this.updatePollButtons(guild, config, { disableT7: true });
                    }

                    // 5. Ping War CN
                    if (currentDay === 0 && currentTime === config.timeCN) {
                        await this.pingWar(guild, config, "CN");
                    }

                    // 6. Deadline → disable tất cả nút + thông báo
                    if (currentDay === 0 && config.signupDeadline && currentTime === config.signupDeadline) {
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
                    }

                    // 7. Cleanup + Archive 23:59 CN
                    if (currentDay === 0 && currentTime === "23:59") {
                        await this.cleanupRoles(guild, config, "T7");
                        await this.cleanupRoles(guild, config, "CN");
                        await this.archivePoll(guild, config);
                    }
                }
            } catch (err) {
                console.error("[Cron GuildWar] Error:", err);
            }
        });
    }

    async sendPoll(guild, config) {
        try {
            const channel = guild.channels.cache.get(config.channelId)
                || await guild.channels.fetch(config.channelId).catch(() => null);
            if (!channel) return;

            const weekId = getCurrentWeekId();
            const payload = buildPollPayload(weekId, config);

            const msg = await channel.send(payload);

            await GuildWarConfig.updateOne(
                { guildId: guild.id },
                { currentPollMessageId: msg.id, currentPollChannelId: channel.id }
            );

            console.log(`[GuildWar] Poll sent → Guild ${guild.id} msg ${msg.id}`);
        } catch (e) {
            console.error(`[GuildWar] sendPoll failed ${guild.id}:`, e);
        }
    }

    async sendReminder(guild, config, dayStr, offsetMinutes) {
        try {
            const channel = guild.channels.cache.get(config.channelId)
                || await guild.channels.fetch(config.channelId).catch(() => null);
            if (!channel) return;

            const roleId = dayStr === "T7" ? config.roleT7 : config.roleCN;
            await channel.send(buildReminderPayload(dayStr, offsetMinutes, roleId));
        } catch (e) {
            console.error(`[GuildWar] sendReminder failed ${guild.id}:`, e);
        }
    }

    async createVoiceChannel(guild, config, dayStr) {
        try {
            if (!config.voiceCategory || !config.voiceNameTemplate) return;

            // Generate name based on template and day
            let vcName = config.voiceNameTemplate;
            if (vcName.includes('{day}')) {
                vcName = vcName.replace('{day}', dayStr === 'T7' ? 'Thứ 7' : 'Chủ Nhật');
            } else {
                vcName = `${vcName} ${dayStr === 'T7' ? 'T7' : 'CN'}`;
            }

            // Create VC
            const vc = await guild.channels.create({
                name: vcName,
                type: ChannelType.GuildVoice,
                parent: config.voiceCategory,
                reason: 'Tự động tạo phòng voice đánh Lãnh Địa Chiến',
            });
            console.log(`[GuildWar] Auto-created Voice Channel: ${vc.name} in guild ${guild.id}`);

            if (dayStr === "T7") {
                config.voiceChannelT7Id = vc.id;
            } else {
                config.voiceChannelCNId = vc.id;
            }
            await config.save();

            // Also post a message in config.channelId that the VC is open
            const channel = guild.channels.cache.get(config.channelId);
            if (channel) {
                const roleId = dayStr === "T7" ? config.roleT7 : config.roleCN;
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
        } catch (e) {
            console.error(`[GuildWar] createVoiceChannel failed ${guild.id}:`, e);
        }
    }

    async checkAndCleanupVoice(guild, config, dayStr) {
        const vcId = dayStr === "T7" ? config.voiceChannelT7Id : config.voiceChannelCNId;
        if (!vcId) return;

        try {
            const now = moment().tz("Asia/Ho_Chi_Minh");
            const currentDay = now.day();
            const currentTime = now.format("HH:mm");

            const targetDay = dayStr === "T7" ? 6 : 0;
            const isAfter10PM = currentDay === targetDay && currentTime >= "22:00";
            const isNextDay = currentDay !== targetDay;

            if (isAfter10PM || isNextDay) {
                const vc = guild.channels.cache.get(vcId) || await guild.channels.fetch(vcId).catch(() => null);

                // if channel is deleted manually or doesn't exist, we clean up DB
                if (!vc) {
                    if (dayStr === "T7") config.voiceChannelT7Id = null;
                    else config.voiceChannelCNId = null;
                    await config.save();
                    return;
                }

                // logic to delete if empty
                if (vc.members.size === 0) {
                    await vc.delete("Hết Lãnh Địa Chiến");
                    if (dayStr === "T7") config.voiceChannelT7Id = null;
                    else config.voiceChannelCNId = null;
                    await config.save();
                    console.log(`[GuildWar] Cleaned up Voice Channel ${vcId} for ${dayStr}`);
                }
            }
        } catch (e) {
            console.error(`[GuildWar] checkAndCleanupVoice failed ${guild.id}:`, e);
        }
    }

    async pingWar(guild, config, dayStr) {
        try {
            const channel = guild.channels.cache.get(config.channelId)
                || await guild.channels.fetch(config.channelId).catch(() => null);
            if (!channel) return;

            let roleId = dayStr === "T7" ? config.roleT7 : config.roleCN;

            if (!roleId) {
                const roleName = `[GW] ${dayStr === "T7" ? "Thứ 7" : "Chủ Nhật"}`;
                let role = guild.roles.cache.find(r => r.name === roleName);
                if (!role) {
                    role = await guild.roles.create({
                        name: roleName,
                        color: dayStr === "T7" ? "#3965FF" : "#F1C40F",
                        reason: "Guild War Auto Provision",
                    });
                }
                roleId = role.id;
                if (dayStr === "T7") config.roleT7 = role.id; else config.roleCN = role.id;
                await config.save();
            }

            await channel.send(buildPingPayload(dayStr, roleId));
        } catch (e) {
            console.error(`[GuildWar] pingWar failed ${guild.id}:`, e);
        }
    }

    async cleanupRoles(guild, config, dayStr) {
        try {
            const roleId = dayStr === "T7" ? config.roleT7 : config.roleCN;
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
        } catch (e) {
            console.error(`[GuildWar] cleanupRoles failed ${guild.id}:`, e);
        }
    }

    async archivePoll(guild, config) {
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
                t7: regs.filter(r => r.days.includes("T7")).length,
                cn: regs.filter(r => r.days.includes("CN")).length,
                all: regs.filter(r => r.days.includes("T7") && r.days.includes("CN")).length,
            };

            const payload = buildPollPayload(weekId, config, counts, { archived: true });
            await message.edit(payload);

            await GuildWarConfig.updateOne(
                { guildId: guild.id },
                { currentPollMessageId: null, currentPollChannelId: null }
            );
        } catch (e) {
            console.error(`[GuildWar] archivePoll failed ${guild.id}:`, e);
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
                t7: regs.filter(r => r.days.includes("T7")).length,
                cn: regs.filter(r => r.days.includes("CN")).length,
                all: regs.filter(r => r.days.includes("T7") && r.days.includes("CN")).length,
            };

            const payload = buildPollPayload(weekId, config, counts, opts);
            await message.edit(payload);
        } catch (e) {
            console.error(`[GuildWar] updatePollButtons failed ${guild.id}:`, e);
        }
    }
}

// ─── Button Interaction Handler ───────────────────────────────────────────────

async function handleGuildWarButton(interaction) {
    if (isButtonSpam(interaction.user.id)) {
        return interaction.reply({ content: "⏳ Bạn bấm quá nhanh! Vui lòng chờ 3 giây.", ephemeral: true });
    }

    // customId: guiwar_btn_T7_2026-W09
    const parts = interaction.customId.split('_');
    const action = parts[2];                            // T7 | CN | ALL | CANCEL
    const weekId = parts.slice(3).join('_');            // 2026-W09

    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const member = interaction.member;

    const config = await GuildWarConfig.findOne({ guildId });
    if (!config) {
        return interaction.editReply("❌ Guild War chưa được cấu hình. Báo Admin dùng `/guiwar-setup`.");
    }

    // Kiểm tra deadline (chỉ áp dụng Chủ Nhật)
    if (action !== "CANCEL" && config.signupDeadline) {
        const now = moment().tz("Asia/Ho_Chi_Minh");
        if (now.day() === 0 && now.format("HH:mm") >= config.signupDeadline) {
            return interaction.editReply(
                `🔒 Đăng ký đã **đóng lúc ${config.signupDeadline}** Chủ Nhật — hẹn tuần sau nhé!`
            );
        }
    }

    // Đảm bảo role tồn tại
    const ensureRole = async (dayStr) => {
        let roleId = dayStr === "T7" ? config.roleT7 : config.roleCN;
        if (!roleId || !interaction.guild.roles.cache.has(roleId)) {
            try {
                const role = await interaction.guild.roles.create({
                    name: `[GW] ${dayStr === "T7" ? "Thứ 7" : "Chủ Nhật"}`,
                    color: dayStr === "T7" ? "#3965FF" : "#F1C40F",
                    reason: "Guild War Auto Provision",
                });
                if (dayStr === "T7") config.roleT7 = role.id; else config.roleCN = role.id;
                await config.save();
                return role;
            } catch (err) {
                if (err.code === 50013) throw new Error("Missing Permissions");
                throw err;
            }
        }
        return interaction.guild.roles.cache.get(roleId);
    };

    let reg = await GuildWarRegistration.findOne({ guildId, weekId, userId });
    if (!reg) {
        // Lấy thông tin đã đăng ký ở /gw-register lưu trong GuildWarMember
        const memberInfo = await GuildWarMember.findOne({ guildId, userId });

        reg = new GuildWarRegistration({
            guildId, weekId, userId, days: [],
            ingameName: memberInfo?.ingameName || '',
            role: memberInfo?.role || ''
        });
    }

    let roleSat, roleSun;
    try {
        roleSat = await ensureRole("T7");
        roleSun = await ensureRole("CN");
    } catch (e) {
        if (e.message === "Missing Permissions") {
            return interaction.editReply(
                "❌ Bot thiếu quyền **Quản Lý Vai Trò**.\n👉 Kéo Role của Bot lên trên cùng trong Server Settings!"
            );
        }
        return interaction.editReply("❌ Lỗi khi tạo Role.");
    }

    if (action !== "CANCEL" && (!reg.ingameName || !reg.role)) {
        return interaction.editReply("⚠️ Bạn cần dùng lệnh `/gw-register` để đăng ký thông tin trước khi báo danh!");
    }

    let msg = "";
    try {
        if (action === "CANCEL") {
            reg.days = [];
            if (member.roles.cache.has(roleSat.id)) await member.roles.remove(roleSat).catch(() => { });
            if (member.roles.cache.has(roleSun.id)) await member.roles.remove(roleSun).catch(() => { });
            msg = "❌ Bạn đã **Hủy Đăng Ký** Guild War tuần này.";
        } else if (action === "ALL") {
            reg.days = ["T7", "CN"];
            await member.roles.add([roleSat, roleSun]);
            msg = "✅ Đăng ký **Cả 2 ngày** (Thứ 7 & Chủ Nhật) thành công!";
        } else if (action === "T7") {
            if (reg.days.includes("T7")) {
                reg.days = reg.days.filter(d => d !== "T7");
                await member.roles.remove(roleSat);
                msg = "➖ Đã hủy lịch **Thứ 7**.";
            } else {
                reg.days.push("T7");
                await member.roles.add(roleSat);
                msg = "✅ Đăng ký **Thứ 7** thành công!";
            }
        } else if (action === "CN") {
            if (reg.days.includes("CN")) {
                reg.days = reg.days.filter(d => d !== "CN");
                await member.roles.remove(roleSun);
                msg = "➖ Đã hủy lịch **Chủ Nhật**.";
            } else {
                reg.days.push("CN");
                await member.roles.add(roleSun);
                msg = "✅ Đăng ký **Chủ Nhật** thành công!";
            }
        }
    } catch (e) {
        console.error("[GW Button] Role error:", e);
        return interaction.editReply("❌ Lỗi khi thêm/xoá Role. Kiểm tra quyền Bot.");
    }

    reg.days = [...new Set(reg.days)];
    await reg.save();

    await updatePlayerStats(guildId, userId, reg.days, weekId);
    await interaction.editReply(msg);

    // Cập nhật poll realtime — rebuild Components V2 container với số mới
    try {
        const allRegs = await GuildWarRegistration.find({ guildId, weekId, 'days.0': { $exists: true } });
        const counts = {
            t7: allRegs.filter(r => r.days.includes("T7")).length,
            cn: allRegs.filter(r => r.days.includes("CN")).length,
            all: allRegs.filter(r => r.days.includes("T7") && r.days.includes("CN")).length,
        };

        const payload = buildPollPayload(weekId, config, counts);
        await interaction.message.edit(payload);
    } catch (err) {
        console.error("[GW] Realtime update error:", err);
    }
}

module.exports = {
    GuildWarService,
    GuildWarScheduler: GuildWarService, // alias for backwards compatibility
    handleGuildWarButton,
    getCurrentWeekId
};
