// utils/guards.js
// Helper functions dùng chung để kiểm tra quyền hạn

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

// User IDs có quyền quản lý bot (ngoài OWNER)
const BOT_ADMINS = [
    '330239277449347075', // shiro
];

/**
 * Kiểm tra xem user có phải owner của bot không
 * @param {string} userId
 */
function isOwner(userId) {
    return userId === process.env.OWNER_ID || BOT_ADMINS.includes(userId);
}

/**
 * Guard: chỉ cho phép Owner thực thi. Nếu không phải owner, reply ephemeral và return true.
 * Cách dùng:
 *   if (await requireOwner(interaction)) return;
 * @returns {boolean} true nếu bị chặn (không phải owner)
 */
async function requireOwner(interaction) {
    if (isOwner(interaction.user.id)) return false;
    const payload = {
        content: '❌ Chỉ chủ bot mới có thể sử dụng lệnh này.',
        flags: MessageFlags.Ephemeral,
    };
    if (interaction.deferred) await interaction.editReply(payload);
    else await interaction.reply(payload);
    return true;
}

/**
 * Guard: kiểm tra member có permission nhất định không.
 * @param {import('discord.js').Interaction} interaction
 * @param {bigint} permission - PermissionFlagsBits.xxx
 * @param {string} [msg] - Thông báo lỗi tùy chỉnh
 * @returns {boolean} true nếu bị chặn
 */
async function requirePermission(interaction, permission, msg = '❌ Bạn không có quyền sử dụng lệnh này.') {
    if (interaction.member?.permissions?.has(permission)) return false;
    const payload = { content: msg, flags: MessageFlags.Ephemeral };
    if (interaction.deferred) await interaction.editReply(payload);
    else await interaction.reply(payload);
    return true;
}

module.exports = { isOwner, requireOwner, requirePermission };
