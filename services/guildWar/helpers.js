const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isoWeek = require('dayjs/plugin/isoWeek');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const TZ = 'Asia/Ho_Chi_Minh';

// ─── Game Assets ─────────────────────────────────────────────────────────────
const BANNER_URL = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3564740/6d94b048393d5358690a04a7db99f2c9739c703c/header.jpg?t=1763157550';
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

const EM = {
    calendar: `<:calendar:1477352232205947084>`,
    saturday: `<:saturday:1477352228305244390>`,
    sunday: `<:sunday:1477352226904346812>`,
    announcement: `<:announcement:1477352822243725382>`,
    useraccount: `<:useraccount:1477352820666536016>`,
};

// ─── Time Helpers ─────────────────────────────────────────────────────────────

/**
 * Lấy ISO week ID hiện tại, ví dụ: "2026-W10"
 * Dùng isoWeek plugin để đảm bảo T7 và CN luôn cùng tuần.
 */
function getCurrentWeekId() {
    const now = dayjs().tz(TZ);
    const year = now.isoWeekYear();
    const week = String(now.isoWeek()).padStart(2, '0');
    return `${year}-W${week}`;
}

/**
 * Trừ số phút từ một chuỗi giờ "HH:mm"
 */
function subtractMinutes(timeStr, minutes) {
    return dayjs.tz(`2000-01-01 ${timeStr}`, TZ)
        .subtract(minutes, 'minute')
        .format('HH:mm');
}

/**
 * Lấy thời điểm hiện tại theo timezone VN
 */
function now() {
    return dayjs().tz(TZ);
}

// ─── Anti-Spam ────────────────────────────────────────────────────────────────

const _buttonCooldowns = new Map();

function isButtonSpam(userId) {
    if (_buttonCooldowns.has(userId)) return true;
    _buttonCooldowns.set(userId, true);
    setTimeout(() => _buttonCooldowns.delete(userId), 3000);
    return false;
}

module.exports = {
    dayjs, TZ,
    BANNER_URL, LOGO_URL, E, EM,
    getCurrentWeekId, subtractMinutes, now,
    isButtonSpam,
};
