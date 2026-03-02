const express = require('express');
const cors = require('cors');
const { GuildWarRegistration, GuildWarStats, GuildWarConfig, GuildConfig, GuildWarMember } = require('../db/schemas');
const { getCurrentWeekId } = require('../services/guildWarService');

// ── API Key Auth Middleware ─────────────────────────────────────────────────
function apiKeyAuth(req, res, next) {
    // Health check không cần auth
    if (req.path === '/health') return next();

    const apiKey = process.env.DASHBOARD_API_KEY;
    if (!apiKey) return next(); // Nếu chưa set key → bỏ qua (backward compat)

    const provided = req.headers['x-api-key'];
    if (provided !== apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
}

function startDashboardApi(client) {
    const app = express();

    // ── CORS — tự động nhận diện môi trường ────────────────────────────────
    const allowedOrigins = [
        'http://localhost:3000',       // local dashboard dev
        'http://localhost:3001',       // local API (same-origin proxy)
        process.env.DASHBOARD_URL,     // production dashboard URL (nếu set)
    ].filter(Boolean);

    app.use(cors({
        origin: (origin, callback) => {
            // Cho phép requests không có origin (server-side proxy, curl, etc.)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    }));
    app.use(express.json());
    app.use(apiKeyAuth);

    // ── Request Logger (dev only) ───────────────────────────────────────────
    if (process.env.MODE === 'dev') {
        app.use((req, _res, next) => {
            console.log(`[API] ${req.method} ${req.path} ← ${req.headers.origin || 'server-side'}`);
            next();
        });
    }

    const PORT = process.env.API_PORT || 3001;

    // ── Health Check ────────────────────────────────────────────────────────
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            uptime: process.uptime(),
            guilds: client.guilds.cache.size,
            timestamp: new Date().toISOString(),
        });
    });

    // --- Fuma-Nama Dashboard Required Routes ---

    // 0. Get all bot joined guild ids
    app.get('/bot/guilds', (req, res) => {
        return res.json(Array.from(client.guilds.cache.keys()));
    });

    // 1. Get Guild Info
    app.get('/guilds/:guildId', async (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json(null);

        // Kiểm tra các features đã thiết lập trên Database
        const guildConfig = await GuildConfig.findOne({ guildId });
        const guiWarConfig = await GuildWarConfig.findOne({ guildId });

        const enabledFeatures = [];
        if (guildConfig && guildConfig.faceForumId) enabledFeatures.push("face-forum");
        if (guiWarConfig && guiWarConfig.isActive) enabledFeatures.push("guiwar");

        // Required by fuma-nama dashboard interface
        return res.json({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            enabledFeatures: enabledFeatures,
        });
    });

    // 2. Get Roles
    app.get('/guilds/:guildId/roles', (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId);
        if (!guild) return res.status(404).json({ message: "Guild Not Found" });

        const roles = guild.roles.cache.map(r => ({
            id: r.id,
            name: r.name,
            color: r.color,
            position: r.position,
            permissions: r.permissions.bitfield.toString()
        }));

        return res.json(roles);
    });

    // 3. Get Channels
    app.get('/guilds/:guildId/channels', (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId);
        if (!guild) return res.status(404).json({ message: "Guild Not Found" });

        const channels = guild.channels.cache.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            parent_id: c.parentId
        }));

        return res.json(channels);
    });

    // --- Custom Guild War API (Cung cấp list và rank cho giao diện web) ---

    // A. API trả về List Đăng ký tuần hiện tại
    app.get('/api/guiwar/:guildId/list', async (req, res) => {
        const guildId = req.params.guildId;
        const weekId = req.query.week || getCurrentWeekId();

        try {
            // Chỉ lấy những ai có đăng ký ít nhất 1 ngày (days không rỗng — loại bỏ người hủy)
            const regs = await GuildWarRegistration.find({ guildId, weekId, 'days.0': { $exists: true } });
            const resultList = await Promise.all(regs.map(async (reg) => {
                let userDisp = `UID: ${reg.userId}`;
                try {
                    const user = await client.users.fetch(reg.userId);
                    userDisp = user.globalName || user.username || userDisp;
                } catch (e) {
                    // Ignore, fallback to UID
                }
                return {
                    userId: userDisp,
                    rawUserId: reg.userId,
                    days: reg.days,
                    role: reg.role,
                    ingameName: reg.ingameName,
                    lane: reg.lane,
                    createdAt: reg.createdAt
                };
            }));

            return res.json({
                week: weekId,
                total: regs.length,
                data: resultList
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // C. Cập nhật vị trí đi đường (lane)
    app.post('/api/guiwar/:guildId/lane', async (req, res) => {
        const guildId = req.params.guildId;
        const { userId, weekId, lane } = req.body;

        try {
            // Update in GuildWarMember (permanent)
            await GuildWarMember.updateOne(
                { guildId, userId },
                { $set: { lane: lane } },
                { upsert: true }
            );

            // Also update in current week if weekId is provided
            if (weekId) {
                await GuildWarRegistration.updateOne(
                    { guildId, weekId, userId },
                    { $set: { lane: lane } }
                );
            } else {
                // If weekId is not provided, update all current registrations to apply the new lane
                await GuildWarRegistration.updateMany(
                    { guildId, userId },
                    { $set: { lane: lane } }
                );
            }
            return res.json({ success: true, message: "Updated lane" });
        } catch (err) {
            console.error("[GW API] Lane Update Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // D. Lấy toàn bộ người dùng đã từng đăng ký Guild War
    app.get('/api/guiwar/:guildId/members', async (req, res) => {
        const guildId = req.params.guildId;

        try {
            const members = await GuildWarMember.find({ guildId });
            const resultList = await Promise.all(members.map(async (mem) => {
                let userDisp = `UID: ${mem.userId}`;
                try {
                    const user = await client.users.fetch(mem.userId);
                    userDisp = user.globalName || user.username || userDisp;
                } catch (e) {
                    // Ignore, fallback to UID
                }
                return {
                    userId: mem.userId,
                    username: userDisp,
                    ingameName: mem.ingameName,
                    role: mem.role,
                    lane: mem.lane,
                    createdAt: mem.createdAt
                };
            }));

            return res.json(resultList);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // B. API trả về Bảng Xếp Hạng (Rankings)
    app.get('/api/guiwar/:guildId/rank', async (req, res) => {
        const guildId = req.params.guildId;

        try {
            // Lấy 50 người dẫn đầu Server
            const stats = await GuildWarStats.find({ guildId })
                .sort({ totalWars: -1 })
                .limit(50);

            const resultList = await Promise.all(stats.map(async (stat) => {
                let userDisp = `UID: ${stat.userId}`;
                try {
                    const user = await client.users.fetch(stat.userId);
                    userDisp = user.globalName || user.username || userDisp;
                } catch (e) {
                    // Ignore fallback
                }

                return {
                    userId: userDisp,
                    totalWars: stat.totalWars,
                    consecutiveWeeks: stat.consecutiveWeeks,
                    lastParticipatedWeek: stat.lastParticipatedWeek
                };
            }));

            return res.json({
                guildId: guildId,
                data: resultList
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // --- Dashboard Settings API endpoints ---

    // GET feature options
    app.get('/guilds/:guildId/features/:featureId', async (req, res) => {
        const { guildId, featureId } = req.params;

        if (featureId === 'face-forum') {
            const config = await GuildConfig.findOne({ guildId });
            if (!config || !config.faceForumId) return res.status(404).json({ error: "Not enabled" });
            return res.json({ faceForumId: config.faceForumId });
        }

        if (featureId === 'guiwar') {
            const config = await GuildWarConfig.findOne({ guildId });
            if (!config || !config.isActive) return res.status(404).json({ error: "Not enabled" });
            return res.json({
                channelId: config.channelId,
                roleT7: config.roleT7,
                roleCN: config.roleCN,
                pollTime: config.pollTime,
                timeT7: config.timeT7,
                timeCN: config.timeCN,
                reminderOffsets: config.reminderOffsets ?? [30, 15, 5],
                signupDeadline: config.signupDeadline ?? '20:00',
                voiceCategory: config.voiceCategory,
                voiceNameTemplate: config.voiceNameTemplate || "Guild War",
            });
        }
        return res.status(404).json({ error: "Feature not found" });
    });

    // POST "Enable" feature
    app.post('/guilds/:guildId/features/:featureId', async (req, res) => {
        try {
            const { guildId, featureId } = req.params;

            if (featureId === 'face-forum') {
                await GuildConfig.updateOne({ guildId }, { faceForumId: "" }, { upsert: true });
            } else if (featureId === 'guiwar') {
                await GuildWarConfig.updateOne({ guildId }, { isActive: true }, { upsert: true });
            }
            return res.json({ success: true });
        } catch (e) {
            console.error("Error enabling feature:", e);
            return res.status(500).json({ error: "Internal Error" });
        }
    });

    // DELETE "Disable" feature
    app.delete('/guilds/:guildId/features/:featureId', async (req, res) => {
        try {
            const { guildId, featureId } = req.params;

            if (featureId === 'face-forum') {
                await GuildConfig.updateOne({ guildId }, { faceForumId: null });
            } else if (featureId === 'guiwar') {
                await GuildWarConfig.updateOne({ guildId }, { isActive: false });
            }
            return res.json({ success: true });
        } catch (e) {
            console.error("Error disabling feature:", e);
            return res.status(500).json({ error: "Internal Error" });
        }
    });

    // PATCH "Update Configuration"
    app.patch('/guilds/:guildId/features/:featureId', async (req, res) => {
        const { guildId, featureId } = req.params;
        const options = req.body;


        if (featureId === 'face-forum') {
            const config = await GuildConfig.findOneAndUpdate(
                { guildId },
                { faceForumId: options.faceForumId },
                { upsert: true, new: true }
            );
            return res.json({ faceForumId: config.faceForumId });
        }

        if (featureId === 'guiwar') {
            const config = await GuildWarConfig.findOneAndUpdate(
                { guildId },
                {
                    channelId: options.channelId,
                    roleT7: options.roleT7,
                    roleCN: options.roleCN,
                    pollTime: options.pollTime,
                    timeT7: options.timeT7,
                    timeCN: options.timeCN,
                    reminderOffsets: options.reminderOffsets,
                    signupDeadline: options.signupDeadline,
                    voiceCategory: options.voiceCategory,
                    voiceNameTemplate: options.voiceNameTemplate,
                    isActive: true
                },
                { upsert: true, new: true }
            );

            return res.json({
                channelId: config.channelId,
                roleT7: config.roleT7,
                roleCN: config.roleCN,
                pollTime: config.pollTime,
                timeT7: config.timeT7,
                timeCN: config.timeCN,
                reminderOffsets: config.reminderOffsets ?? [30, 15, 5],
                signupDeadline: config.signupDeadline ?? '20:00',
                voiceCategory: config.voiceCategory,
                voiceNameTemplate: config.voiceNameTemplate || "Guild War",
            });
        }

        return res.status(404).json({ error: "Feature not found" });
    });

    // ── Centralized Error Handler ────────────────────────────────────────
    app.use((err, req, res, _next) => {
        console.error('[Dashboard API] Unhandled Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    app.listen(PORT, () => {
        console.log(`[Dashboard API] Server is running on port ${PORT}`);
    });
}

module.exports = { startDashboardApi };
