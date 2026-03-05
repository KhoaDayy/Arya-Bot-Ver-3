const { GuildWarConfig } = require('../../db/schemas');

const CACHE_TTL_MS = 5 * 60_000; // 5 phút

/**
 * Dual-mode config cache.
 * Nếu có REDIS_URL → dùng Redis, không thì fallback về in-memory Map.
 */
class ConfigCache {
    constructor() {
        this._memoryStore = null;       // in-memory cache
        this._lastRefresh = 0;
        this._redis = null;             // redis client (lazy init)
        this._redisKey = 'gw:configs';
        this._initialized = false;
    }

    /** Khởi tạo Redis nếu có REDIS_URL */
    async init() {
        if (this._initialized) return;
        this._initialized = true;

        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            console.log('[GW Cache] Using in-memory cache (no REDIS_URL set)');
            return;
        }

        try {
            // Dynamic import — chỉ cần cài redis nếu muốn dùng
            const { createClient } = require('redis');
            this._redis = createClient({ url: redisUrl });
            this._redis.on('error', (err) => console.error('[GW Cache] Redis error:', err));
            await this._redis.connect();
            console.log('[GW Cache] Connected to Redis');
        } catch (e) {
            console.warn('[GW Cache] Redis unavailable, falling back to in-memory:', e.message);
            this._redis = null;
        }
    }

    /** Lấy tất cả active configs, cache theo TTL */
    async getConfigs() {
        await this.init();

        // ── Redis path ────────────────────────────────────────────
        if (this._redis) {
            try {
                const cached = await this._redis.get(this._redisKey);
                if (cached) {
                    // Redis lưu JSON string, cần hydrate lại thành Mongoose docs
                    // Nhưng ta cần Mongoose docs cho .save() → chỉ cache IDs,
                    // rồi re-fetch bằng $in. Hoặc đơn giản: cache thời gian,
                    // còn data vẫn lấy từ DB.
                    // → Approach: dùng Redis như TTL flag, DB vẫn là source of truth.
                    return this._memoryStore || await this._fetchFromDB();
                }
                const configs = await this._fetchFromDB();
                // Set Redis key với TTL
                await this._redis.set(this._redisKey, '1', { EX: Math.floor(CACHE_TTL_MS / 1000) });
                return configs;
            } catch (e) {
                console.error('[GW Cache] Redis getConfigs error:', e.message);
                // Fallback to memory
            }
        }

        // ── In-memory path ────────────────────────────────────────
        const now = Date.now();
        if (this._memoryStore && (now - this._lastRefresh < CACHE_TTL_MS)) {
            return this._memoryStore;
        }
        return await this._fetchFromDB();
    }

    async _fetchFromDB() {
        this._memoryStore = await GuildWarConfig.find({ isActive: true });
        this._lastRefresh = Date.now();
        return this._memoryStore;
    }

    /** Xóa cache — force refresh lần gọi tiếp theo */
    invalidate() {
        this._memoryStore = null;
        this._lastRefresh = 0;
        if (this._redis) {
            this._redis.del(this._redisKey).catch(() => { });
        }
    }

    /** Graceful shutdown */
    async disconnect() {
        if (this._redis) {
            await this._redis.quit().catch(() => { });
        }
    }
}

// Singleton — dùng chung cho toàn bộ service
const configCache = new ConfigCache();

module.exports = { configCache };
