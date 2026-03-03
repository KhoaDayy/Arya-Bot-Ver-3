const cron = require('node-cron');
const { now, subtractMinutes } = require('./helpers');
const { configCache } = require('./cache');

/**
 * Smart scheduler — dispatches events in parallel per guild.
 * Thay vì loop tuần tự blocking, dùng Promise.allSettled để guild lỗi không ảnh hưởng guild khác.
 */
class GuildWarScheduler {
    /**
     * @param {import('./GuildWarService').GuildWarService} service
     */
    constructor(service) {
        this.service = service;
    }

    start() {
        console.log('🕒 Starting GuildWar Cron Job...');
        cron.schedule('* * * * *', () => this._tick(), {
            timezone: 'Asia/Ho_Chi_Minh',
        });
    }

    async _tick() {
        try {
            const configs = await configCache.getConfigs();
            // Xử lý tất cả guild song song — 1 guild lỗi không block guild khác
            await Promise.allSettled(
                configs.map(config => this._processGuild(config))
            );
        } catch (err) {
            console.error('[Cron GuildWar] Tick error:', err);
        }
    }

    async _processGuild(config) {
        const currentNow = now();
        const currentDay = currentNow.day(); // 0=CN, 6=T7
        const currentTime = currentNow.format('HH:mm');

        const guild = this.service.client.guilds.cache.get(config.guildId);
        if (!guild) return;

        // 1. Gửi Poll (theo pollDay cấu hình)
        if (currentDay === config.pollDay && currentTime === config.pollTime) {
            await this.service.sendPoll(guild, config);
        }

        // 2 & 3. Reminders T7 / CN + Voice Channel Creation
        const offsets = config.reminderOffsets || [];
        const maxOffset = offsets.length > 0 ? Math.max(...offsets) : -1;

        for (const offset of offsets) {
            if (currentDay === 6 && currentTime === subtractMinutes(config.timeT7, offset)) {
                await this.service.sendReminder(guild, config, 'T7', offset);
                if (offset === maxOffset) await this.service.createVoiceChannel(guild, config, 'T7');
            }
            if (currentDay === 0 && currentTime === subtractMinutes(config.timeCN, offset)) {
                await this.service.sendReminder(guild, config, 'CN', offset);
                if (offset === maxOffset) await this.service.createVoiceChannel(guild, config, 'CN');
            }
        }

        // 3.5 Cleanup Voice after 22:00
        if (config.voiceChannelT7Id) await this.service.checkAndCleanupVoice(guild, config, 'T7');
        if (config.voiceChannelCNId) await this.service.checkAndCleanupVoice(guild, config, 'CN');

        // 4. Ping War T7 + disable T7/ALL nút
        if (currentDay === 6 && currentTime === config.timeT7) {
            await this.service.pingWar(guild, config, 'T7');
            await this.service.updatePollButtons(guild, config, { disableT7: true });
        }

        // 5. Ping War CN
        if (currentDay === 0 && currentTime === config.timeCN) {
            await this.service.pingWar(guild, config, 'CN');
        }

        // 6. Deadline → disable tất cả nút + thông báo
        if (currentDay === 0 && config.signupDeadline && currentTime === config.signupDeadline) {
            await this.service.closeSignup(guild, config);
        }

        // 7. Cleanup + Archive 23:59 CN
        if (currentDay === 0 && currentTime === '23:59') {
            await this.service.cleanupRoles(guild, config, 'T7');
            await this.service.cleanupRoles(guild, config, 'CN');
            await this.service.archivePoll(guild, config);
        }
    }
}

module.exports = { GuildWarScheduler };
