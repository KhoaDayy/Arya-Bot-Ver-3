const { now, getCurrentWeekId, isButtonSpam } = require('./helpers');
const { buildPollPayload } = require('./builders');
const { configCache } = require('./cache');
const { roleService } = require('./RoleProvisionService');
const { GuildWarConfig, GuildWarRegistration, GuildWarStats, GuildWarMember } = require('../../db/schemas');

// ─── Stats ───────────────────────────────────────────────────────────────────

async function updatePlayerStats(guildId, userId, days, weekId) {
    try {
        const prevNow = now().subtract(1, 'week');
        const prevYear = prevNow.isoWeekYear();
        const prevWeek = String(prevNow.isoWeek()).padStart(2, '0');
        const prevWeekId = `${prevYear}-W${prevWeek}`;

        let stats = await GuildWarStats.findOne({ guildId, userId });
        if (!stats) {
            stats = new GuildWarStats({ guildId, userId, totalWars: 0, consecutiveWeeks: 0, lastParticipatedWeek: '' });
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
                stats.lastParticipatedWeek = '';
                if (stats.consecutiveWeeks > 0) stats.consecutiveWeeks -= 1;
            }
        }
        await stats.save();
    } catch (e) {
        console.error('[GuildWar] updatePlayerStats error:', e);
    }
}

// ─── Button Interaction Handler ───────────────────────────────────────────────

async function handleGuildWarButton(interaction) {
    if (isButtonSpam(interaction.user.id)) {
        return interaction.reply({ content: '⏳ Bạn bấm quá nhanh! Vui lòng chờ 3 giây.', ephemeral: true });
    }

    // customId: guiwar_btn_T7_2026-W09
    const parts = interaction.customId.split('_');
    const action = parts[2];                         // T7 | CN | ALL | CANCEL
    const weekId = parts.slice(3).join('_');          // 2026-W09

    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const member = interaction.member;

    const config = await GuildWarConfig.findOne({ guildId });
    if (!config) {
        return interaction.editReply('❌ Guild War chưa được cấu hình. Báo Admin dùng `/guiwar-setup`.');
    }

    // Kiểm tra deadline (chỉ áp dụng Chủ Nhật)
    if (action !== 'CANCEL' && config.signupDeadline) {
        const currentNow = now();
        if (currentNow.day() === 0 && currentNow.format('HH:mm') >= config.signupDeadline) {
            return interaction.editReply(
                `🔒 Đăng ký đã **đóng lúc ${config.signupDeadline}** Chủ Nhật — hẹn tuần sau nhé!`
            );
        }
    }

    // Đảm bảo role tồn tại — dùng centralized roleService
    let roleSat, roleSun;
    try {
        roleSat = await roleService.ensureRole(interaction.guild, config, 'T7');
        roleSun = await roleService.ensureRole(interaction.guild, config, 'CN');
    } catch (e) {
        if (e.code === 50013 || e.message === 'Missing Permissions') {
            return interaction.editReply(
                '❌ Bot thiếu quyền **Quản Lý Vai Trò**.\n👉 Kéo Role của Bot lên trên cùng trong Server Settings!'
            );
        }
        return interaction.editReply('❌ Lỗi khi tạo Role.');
    }

    let reg = await GuildWarRegistration.findOne({ guildId, weekId, userId });
    if (!reg) {
        const memberInfo = await GuildWarMember.findOne({ guildId, userId });
        reg = new GuildWarRegistration({
            guildId, weekId, userId, days: [],
            ingameName: memberInfo?.ingameName || '',
            role: memberInfo?.role || '',
        });
    }

    if (action !== 'CANCEL' && (!reg.ingameName || !reg.role)) {
        return interaction.editReply('⚠️ Bạn cần dùng lệnh `/gw-register` để đăng ký thông tin trước khi báo danh!');
    }

    let msg = '';
    try {
        if (action === 'CANCEL') {
            reg.days = [];
            if (member.roles.cache.has(roleSat.id)) await member.roles.remove(roleSat).catch(() => { });
            if (member.roles.cache.has(roleSun.id)) await member.roles.remove(roleSun).catch(() => { });
            msg = '❌ Bạn đã **Hủy Đăng Ký** Guild War tuần này.';
        } else if (action === 'ALL') {
            reg.days = ['T7', 'CN'];
            await member.roles.add([roleSat, roleSun]);
            msg = '✅ Đăng ký **Cả 2 ngày** (Thứ 7 & Chủ Nhật) thành công!';
        } else if (action === 'T7') {
            if (reg.days.includes('T7')) {
                reg.days = reg.days.filter(d => d !== 'T7');
                await member.roles.remove(roleSat);
                msg = '➖ Đã hủy lịch **Thứ 7**.';
            } else {
                reg.days.push('T7');
                await member.roles.add(roleSat);
                msg = '✅ Đăng ký **Thứ 7** thành công!';
            }
        } else if (action === 'CN') {
            if (reg.days.includes('CN')) {
                reg.days = reg.days.filter(d => d !== 'CN');
                await member.roles.remove(roleSun);
                msg = '➖ Đã hủy lịch **Chủ Nhật**.';
            } else {
                reg.days.push('CN');
                await member.roles.add(roleSun);
                msg = '✅ Đăng ký **Chủ Nhật** thành công!';
            }
        }
    } catch (e) {
        console.error('[GW Button] Role error:', e);
        return interaction.editReply('❌ Lỗi khi thêm/xoá Role. Kiểm tra quyền Bot.');
    }

    reg.days = [...new Set(reg.days)];
    await reg.save();

    await updatePlayerStats(guildId, userId, reg.days, weekId);
    await interaction.editReply(msg);

    // Cập nhật poll realtime — rebuild Components V2 container với số mới
    try {
        const allRegs = await GuildWarRegistration.find({ guildId, weekId, 'days.0': { $exists: true } });
        const counts = {
            t7: allRegs.filter(r => r.days.includes('T7')).length,
            cn: allRegs.filter(r => r.days.includes('CN')).length,
            all: allRegs.filter(r => r.days.includes('T7') && r.days.includes('CN')).length,
        };

        const payload = buildPollPayload(weekId, config, counts);
        await interaction.message.edit(payload);
    } catch (err) {
        console.error('[GW] Realtime update error:', err);
    }
}

module.exports = { handleGuildWarButton };
