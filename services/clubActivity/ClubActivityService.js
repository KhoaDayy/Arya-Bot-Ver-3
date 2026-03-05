const axios = require('axios');
const { ClubActivityConfig, ClubActivitySnapshot } = require('../../db/schemas');
const { getCurrentWeekId } = require('../guildWar/helpers');

const WWM_API = process.env.WWM_LOCAL_API || 'http://localhost:3003';

class ClubActivityService {
    constructor(client) {
        this.client = client;
    }

    /**
     * Fetch club members từ API và lưu snapshot vào DB
     * @param {string} guildId - Discord guild ID
     * @param {object} [configOverride] - Override config (dùng cho force fetch)
     * @returns {object} snapshot data
     */
    async fetchAndSaveSnapshot(guildId, configOverride = null) {
        const config = configOverride || await ClubActivityConfig.findOne({ guildId, isActive: true });
        if (!config || (!config.clubId && !config.clubName)) {
            throw new Error('Club chưa được liên kết với server này.');
        }

        // Build query params
        const params = { server: config.server || 'SEA' };
        if (config.clubId) {
            params.club_id = config.clubId;
        } else {
            params.name = config.clubName;
        }

        const response = await axios.get(`${WWM_API}/club_members`, {
            params,
            timeout: 30000,
        });

        const data = response.data;
        if (!data || data.error) {
            throw new Error(data?.error || 'Lỗi khi fetch club members.');
        }

        const weekId = getCurrentWeekId();

        const snapshot = await ClubActivitySnapshot.findOneAndUpdate(
            { guildId, weekId },
            {
                guildId,
                weekId,
                clubName: data.club_name,
                clubLevel: data.club_level,
                clubLiveness: data.club_liveness,
                clubFame: data.club_fame,
                memberCount: data.member_count,
                fetchedAt: new Date(),
                members: (data.members || []).map(m => ({
                    pid: m.pid,
                    nickname: m.nickname,
                    level: m.level,
                    number_id: m.number_id,
                    position: m.position,
                    hostnum: m.hostnum,
                    week_activity_point: m.week_activity_point,
                    last_week_activity: m.last_week_activity,
                    month_activity: m.month_activity,
                    total_activity: m.total_activity,
                    week_fund: m.week_fund,
                    total_fund: m.total_fund,
                })),
            },
            { upsert: true, new: true }
        );

        // Cập nhật clubId + clubName từ API response nếu chưa có
        if (!config.clubId && data.club_id) {
            await ClubActivityConfig.updateOne(
                { guildId },
                { clubId: data.club_id, clubName: data.club_name }
            );
        }

        return snapshot;
    }

    /**
     * Lấy snapshot theo tuần (hoặc mới nhất nếu không truyền weekId)
     */
    async getSnapshot(guildId, weekId) {
        if (weekId) {
            return ClubActivitySnapshot.findOne({ guildId, weekId });
        }
        return ClubActivitySnapshot.findOne({ guildId }).sort({ fetchedAt: -1 });
    }

    /**
     * Liệt kê tất cả tuần đã có snapshot
     */
    async listWeeks(guildId) {
        const snapshots = await ClubActivitySnapshot.find({ guildId })
            .select('weekId fetchedAt clubName memberCount')
            .sort({ weekId: -1 });
        return snapshots.map(s => ({
            weekId: s.weekId,
            fetchedAt: s.fetchedAt,
            clubName: s.clubName,
            memberCount: s.memberCount,
        }));
    }

    /**
     * Lấy config
     */
    async getConfig(guildId) {
        return ClubActivityConfig.findOne({ guildId });
    }

    /**
     * Auto-fetch cho tất cả guild đã cấu hình
     */
    async fetchAll() {
        const configs = await ClubActivityConfig.find({ isActive: true });
        const results = await Promise.allSettled(
            configs.map(config => this.fetchAndSaveSnapshot(config.guildId, config))
        );

        let success = 0, failed = 0;
        results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
                success++;
                console.log(`[ClubActivity] ✅ Fetched for guild ${configs[i].guildId} (${configs[i].clubName})`);
            } else {
                failed++;
                console.error(`[ClubActivity] ❌ Failed for guild ${configs[i].guildId}:`, r.reason?.message);
            }
        });

        return { success, failed, total: configs.length };
    }
}

module.exports = { ClubActivityService };
