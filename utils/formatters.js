// utils/formatters.js
// Shared formatting utilities — DRY: dùng chung cho player-lookup, club-lookup, face-converter, face-lookup

/**
 * Format số lớn thành dạng gọn: 1.2M, 3.5K
 */
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

/**
 * Tạo thanh tiến trình ASCII
 * @param {number} current
 * @param {number} max
 * @param {number} size - Số ký tự
 */
function createBar(current, max, size = 10) {
    const progress = Math.round((current / max) * size);
    const empty = size - progress;
    return '▰'.repeat(progress) + '▱'.repeat(empty);
}

/**
 * Trả về giới tính từ body_type code
 * @param {number} type - 1 = Nam, 0 = Nữ
 */
function getBodyType(type) {
    const types = { 1: 'Nam', 0: 'Nữ' };
    return types[type] || 'Không rõ';
}

/**
 * Format số đẹp bằng Intl
 */
function fmt(n) {
    return n ? new Intl.NumberFormat().format(n) : '0';
}

module.exports = { formatNumber, createBar, getBodyType, fmt };
