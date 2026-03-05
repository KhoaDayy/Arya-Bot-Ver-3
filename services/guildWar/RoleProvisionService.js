const { configCache } = require('./cache');

const ROLE_COLORS = {
    T7: '#3965FF',
    CN: '#F1C40F',
};

const ROLE_LABELS = {
    T7: 'Thứ 7',
    CN: 'Chủ Nhật',
};

/**
 * Central Role Provision Service.
 * Xử lý việc tạo/lấy role Guild War với mutex lock để tránh race condition.
 */
class RoleProvisionService {
    constructor() {
        /** @type {Map<string, Promise<import('discord.js').Role>>} */
        this._locks = new Map();
    }

    /**
     * Lấy hoặc tạo role GW cho một ngày, với lock chống duplicate.
     * @param {import('discord.js').Guild} guild
     * @param {object} config - GuildWarConfig mongoose document
     * @param {"T7"|"CN"} dayStr
     * @returns {Promise<import('discord.js').Role>}
     */
    async ensureRole(guild, config, dayStr) {
        const lockKey = `${guild.id}_${dayStr}`;

        // Nếu đang có request khác cùng guild+day → await nó
        if (this._locks.has(lockKey)) {
            return this._locks.get(lockKey);
        }

        const promise = this._doEnsureRole(guild, config, dayStr);
        this._locks.set(lockKey, promise);
        try {
            return await promise;
        } finally {
            this._locks.delete(lockKey);
        }
    }

    /**
     * Logic thực tế: check cache → fetch fresh → find hoặc create
     * @private
     */
    async _doEnsureRole(guild, config, dayStr) {
        const roleId = dayStr === 'T7' ? config.roleT7 : config.roleCN;

        // Nếu đã có ID và role vẫn tồn tại trong server
        if (roleId && guild.roles.cache.has(roleId)) {
            return guild.roles.cache.get(roleId);
        }

        // Fetch danh sách roles mới nhất từ Discord API (tránh dùng cache cũ)
        await guild.roles.fetch();

        const roleName = `[GW] ${ROLE_LABELS[dayStr]}`;
        let role = guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            role = await guild.roles.create({
                name: roleName,
                color: ROLE_COLORS[dayStr],
                reason: 'Guild War Auto Provision',
            });
        }

        // Lưu role ID vào config
        if (dayStr === 'T7') config.roleT7 = role.id;
        else config.roleCN = role.id;
        await config.save();
        configCache.invalidate();

        return role;
    }
}

// Singleton
const roleService = new RoleProvisionService();

module.exports = { roleService };
