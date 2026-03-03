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
} = require('discord.js');

const { BANNER_URL, LOGO_URL, E, EM } = require('./helpers');

// ─── Template Engine ──────────────────────────────────────────────────────────

/**
 * Thay thế các biến {key} trong template string.
 * VD: "Còn {minutes} phút — {day}" → "Còn 30 phút — Thứ 7"
 */
function renderTemplate(template, vars = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

/** Parse hex color string "#5865F2" → 0x5865F2, fallback nếu invalid */
function parseColor(hexStr, fallback) {
    if (!hexStr) return fallback;
    const cleaned = hexStr.replace('#', '');
    const num = parseInt(cleaned, 16);
    return isNaN(num) ? fallback : num;
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
 * @returns {{ components: ContainerBuilder[], flags: number }}
 */
function buildPollPayload(weekId, config, counts = { t7: 0, cn: 0, all: 0 }, opts = {}) {
    const { archived = false, disableT7 = false, disableCN = false, disabled = false } = opts;
    const c = config.customization || {};
    const weekNum = weekId.split('-W')[1];

    const banner = c.bannerUrl || BANNER_URL;
    const logo = c.logoUrl || LOGO_URL;
    const pollTitle = c.pollTitle || 'Báo Danh Guild War';

    const accentColor = archived
        ? 0x7f8c8d
        : parseColor(c.accentColorPoll, 0x5865F2);

    const container = new ContainerBuilder().setAccentColor(accentColor);

    if (!archived) {
        // ── Banner ────────────────────────────────────────────────────
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(banner)
            )
        );

        // ── Tiêu đề + Lịch đánh ───────────────────────────────────────
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ${EM.announcement} ${pollTitle} — Tuần ${weekNum}\n` +
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
                        `## ✅ [ĐÃ KẾT THÚC] ${pollTitle} — Tuần ${weekNum}`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(logo)
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
function buildPingPayload(dayStr, roleId, config = {}) {
    const c = config.customization || {};
    const mention = roleId ? `<@&${roleId}>` : '@everyone';
    const dayLabel = dayStr === "T7" ? "Thứ 7 (Saturday)" : "Chủ Nhật (Sunday)";
    const accentColor = parseColor(c.accentColorPing, 0xE74C3C);

    const defaultMsg =
        `## 🚨 ĐẾN GIỜ WAR RỒI ANH EM!\n### ${dayLabel}\n` +
        `${mention}\n` +
        `> Vui lòng online vào game **ngay bây giờ**, tập kết và Join Voice!\n` +
        `> Chúc party đánh war thành công rực rỡ! 💪`;

    const content = c.pingMessage
        ? renderTemplate(c.pingMessage, { mention, day: dayLabel })
        : defaultMsg;

    const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(content)
        );

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    };
}

/** Build reminder container */
function buildReminderPayload(dayStr, offsetMinutes, roleId, config = {}) {
    const c = config.customization || {};
    const mention = roleId ? `<@&${roleId}>` : '@everyone';
    const dayLabel = dayStr === "T7" ? "Thứ 7" : "Chủ Nhật";
    const accentColor = parseColor(c.accentColorReminder, 0xF39C12);

    const defaultMsg =
        `## ⏰ Còn ${offsetMinutes} phút — Guild War ${dayLabel}!\n` +
        `${mention} Chuẩn bị vào game và Join Voice nhé!`;

    const content = c.reminderMessage
        ? renderTemplate(c.reminderMessage, { mention, day: dayLabel, minutes: String(offsetMinutes) })
        : defaultMsg;

    const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(content)
        );

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    };
}

module.exports = {
    buildPollButtons,
    buildPollPayload,
    buildPingPayload,
    buildReminderPayload,
};
