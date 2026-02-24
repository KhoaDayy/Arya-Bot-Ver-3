// modules/commands/wwm-stats.js
// Lệnh /wwm-stats: nhập stats nhân vật WWM, tính DPS/HPS, so sánh với baseline lv85

const {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    MessageFlags,
    time,
    TimestampStyles,
    bold, italic, inlineCode,
    userMention,
    // Components v2
    ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize,
    // Interactive components
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle,
} = require('discord.js');
const { WwmStats } = require('../../db/schemas');
const { createCanvas } = require('canvas');

// ===========================================================================
// CONFIG: Baseline lv85 stats (cột "85 Basic" trong file Excel)
// ===========================================================================
const WEAPON_CONFIG = {
    sword: {
        name: 'Sword ⚔️ (Kiếm)',
        emoji: '⚔️',
        color: 0x5865F2,
        dpsLabel: 'DPS',
        baseline: {
            minAtk: 577, maxAtk: 1024, precision: 0.853, criti: 0.234, dirCriti: 0,
            critiDmg: 0.5, affinity: 0.115, dirAffinity: 0, affinityDmg: 0.35,
            minAttri: 198, maxAttri: 397, phyPen: 0, phyDmg: 0,
            attriPen: 8, attriDmg: 0.04, bossDmg: 0, weaponBoost: 0, allWeaponBoost: 0,
            mysticBoost: 0, mysticAreaBoost: 0
        }
    },
    umbrella_dps: {
        name: 'Umbrella DPS ☂️ (Quạt Dù DPS)',
        emoji: '☂️',
        color: 0x57F287,
        dpsLabel: 'DPS',
        baseline: {
            minAtk: 577, maxAtk: 1024, precision: 0.853, criti: 0.234, dirCriti: 0,
            critiDmg: 0.5, affinity: 0.115, dirAffinity: 0, affinityDmg: 0.35,
            minAttri: 198, maxAttri: 397, phyPen: 0, phyDmg: 0,
            attriPen: 8, attriDmg: 0.04, bossDmg: 0, weaponBoost: 0, allWeaponBoost: 0,
            mysticBoost: 0, mysticAreaBoost: 0
        }
    },
    umbrella_heal: {
        name: 'Umbrella Heal � (Quạt Dù Heal)',
        emoji: '�',
        color: 0x1ABC9C,
        dpsLabel: 'HPS',
        baseline: {
            minAtk: 577, maxAtk: 1024, precision: 0.853, criti: 0.234, dirCriti: 0,
            critiDmg: 0.5, affinity: 0.115, dirAffinity: 0, affinityDmg: 0.35,
            minAttri: 198, maxAttri: 397, phyPen: 0, phyDmg: 0,
            attriPen: 8, attriDmg: 0.04, bossDmg: 0, weaponBoost: 0, allWeaponBoost: 0,
            mysticBoost: 0, mysticAreaBoost: 0
        }
    },
    spear: {
        name: 'Spear � (Thương)',
        emoji: '�',
        color: 0xFEE75C,
        dpsLabel: 'DPS',
        baseline: {
            minAtk: 577, maxAtk: 1024, precision: 0.853, criti: 0.234, dirCriti: 0,
            critiDmg: 0.5, affinity: 0.115, dirAffinity: 0, affinityDmg: 0.35,
            minAttri: 198, maxAttri: 397, phyPen: 0, phyDmg: 0,
            attriPen: 8, attriDmg: 0.04, bossDmg: 0, weaponBoost: 0, allWeaponBoost: 0,
            mysticBoost: 0, mysticAreaBoost: 0
        }
    },
    dualblades: {
        name: 'Dual Blades 🗡️ (Song Đao)',
        emoji: '🗡️',
        color: 0xEB459E,
        dpsLabel: 'DPS',
        baseline: {
            minAtk: 577, maxAtk: 1024, precision: 0.853, criti: 0.234, dirCriti: 0,
            critiDmg: 0.5, affinity: 0.115, dirAffinity: 0, affinityDmg: 0.35,
            minAttri: 198, maxAttri: 397, phyPen: 0, phyDmg: 0,
            attriPen: 8, attriDmg: 0.04, bossDmg: 0, weaponBoost: 0, allWeaponBoost: 0,
            mysticBoost: 0, mysticAreaBoost: 0
        }
    },
    moblade: {
        name: 'Mo Blade ⚔️ (Mạch Đao)',
        emoji: '�',
        color: 0xED4245,
        dpsLabel: 'DPS',
        baseline: {
            minAtk: 577, maxAtk: 1024, precision: 0.853, criti: 0.234, dirCriti: 0,
            critiDmg: 0.5, affinity: 0.115, dirAffinity: 0, affinityDmg: 0.35,
            minAttri: 198, maxAttri: 397, phyPen: 0, phyDmg: 0,
            attriPen: 8, attriDmg: 0.04, bossDmg: 0, weaponBoost: 0, allWeaponBoost: 0,
            mysticBoost: 0, mysticAreaBoost: 0
        }
    },
    ropedart: {
        name: 'Rope Dart � (Roi)',
        emoji: '�',
        color: 0x9B59B6,
        dpsLabel: 'DPS',
        baseline: {
            minAtk: 577, maxAtk: 1024, precision: 0.853, criti: 0.234, dirCriti: 0,
            critiDmg: 0.5, affinity: 0.115, dirAffinity: 0, affinityDmg: 0.35,
            minAttri: 198, maxAttri: 397, phyPen: 0, phyDmg: 0,
            attriPen: 8, attriDmg: 0.04, bossDmg: 0, weaponBoost: 0, allWeaponBoost: 0,
            mysticBoost: 0, mysticAreaBoost: 0
        }
    }
};

// Danh sách các stat — dùng Map để O(1) lookup thay vì .find()
const STAT_FIELDS = [
    { key: 'minAtk', label: 'Min ATK (Physical Attack)', isPercent: false, emoji: '⚔️' },
    { key: 'maxAtk', label: 'Max ATK (Physical Attack)', isPercent: false, emoji: '⚔️' },
    { key: 'precision', label: 'Precision Rate (Bạo Kích)', isPercent: true, emoji: '🎯' },
    { key: 'criti', label: 'Critical Rate (Hội Tâm)', isPercent: true, emoji: '💥' },
    { key: 'dirCriti', label: 'Direct Critical Rate', isPercent: true, emoji: '💥' },
    { key: 'critiDmg', label: 'Critical DMG Bonus', isPercent: true, emoji: '🔥' },
    { key: 'affinity', label: 'Affinity Rate (Hội Ý)', isPercent: true, emoji: '✨' },
    { key: 'dirAffinity', label: 'Direct Affinity Rate', isPercent: true, emoji: '✨' },
    { key: 'affinityDmg', label: 'Affinity DMG Bonus', isPercent: true, emoji: '💫' },
    { key: 'minAttri', label: 'Min Attri. (Attribute Attack)', isPercent: false, emoji: '🌊' },
    { key: 'maxAttri', label: 'Max Attri. (Attribute Attack)', isPercent: false, emoji: '🌊' },
    { key: 'phyPen', label: 'Physical Penetration', isPercent: false, emoji: '🗡️' },
    { key: 'phyDmg', label: 'Physical DMG Bonus', isPercent: true, emoji: '💢' },
    { key: 'attriPen', label: 'Attri. Attack Penetration', isPercent: false, emoji: '🔮' },
    { key: 'attriDmg', label: 'Attri. Attack DMG Bonus', isPercent: true, emoji: '🌟' },
    { key: 'bossDmg', label: 'DMG Boost Vs. Boss Units', isPercent: true, emoji: '👑' },
    { key: 'weaponBoost', label: 'Specified Weapon Martial Art Boost', isPercent: true, emoji: '⚡' },
    { key: 'allWeaponBoost', label: 'All Martial Art Skill DMG Boost', isPercent: true, emoji: '⚡' },
    { key: 'mysticBoost', label: 'Single-Target Mystic Skill DMG', isPercent: true, emoji: '🔯' },
    { key: 'mysticAreaBoost', label: 'Area Mystic Skill DMG Boost', isPercent: true, emoji: '🔯' },
    // Healer stats
    { key: 'minHeal', label: 'Min Attribute Healing', isPercent: false, emoji: '💚' },
    { key: 'maxHeal', label: 'Max Attribute Healing', isPercent: false, emoji: '💚' },
    { key: 'critHealBonus', label: 'Critical Healing Bonus', isPercent: true, emoji: '➕' },
    { key: 'phyHealBonus', label: 'Physical Healing Bonus', isPercent: true, emoji: '➕' },
    { key: 'attriHealBonus', label: 'Attri. Attack Healing Bonus', isPercent: true, emoji: '➕' },
];

// Map để tra cứu O(1) thay vì .find() O(n) trong các vòng lặp
const STAT_FIELD_MAP = new Map(STAT_FIELDS.map(f => [f.key, f]));

// Choices được tái sử dụng (DRY) - tránh lặp 3-4 lần ở builder
const WEAPON_CHOICES = [
    { name: '⚔️ Sword (Kiếm)', value: 'sword' },
    { name: '☂️ Umbrella DPS (Quạt Dù DPS)', value: 'umbrella_dps' },
    { name: '💚 Umbrella Heal (Quạt Dù Heal)', value: 'umbrella_heal' },
    { name: '🔱 Spear (Thương)', value: 'spear' },
    { name: '🗡️ Dual Blades (Song Đao)', value: 'dualblades' },
    { name: 'Mo Blade (Mạch Đao)', value: 'moblade' },
    { name: '🎯 Rope Dart (Roi)', value: 'ropedart' },
];

// Giá trị mỗi affix roll (từ bảng tính lv85)
const AFFIX_ROLL_VALUES = {
    minAtk: 47, maxAtk: 47,
    precision: 0.048, criti: 0.054, dirCriti: 0.054,
    critiDmg: 0.05, affinity: 0.028, dirAffinity: 0.028,
    affinityDmg: 0.035, minAttri: 26.6, maxAttri: 26.6,
    phyPen: 6.6, phyDmg: 0.02,
    attriPen: 7.6, attriDmg: 0.034,
    bossDmg: 0.02, weaponBoost: 0.038,
    allWeaponBoost: 0.02, mysticBoost: 0.06, mysticAreaBoost: 0.06,
};

/**
 * 提升 + 词条领先度 analysis (từ bảng tính Excel)
 * 提升 = bumped_DPS / current_DPS - 1
 * 词条领先度 = improvement / min_positive_improvement - 1, hoặc "垃圾" nếu 0
 */
function calculateAnalysis(stats, weaponType) {
    const currentDps = calculateOutput(stats, weaponType);
    if (currentDps === 0) return [];

    const gains = [];
    for (const [key, rollValue] of Object.entries(AFFIX_ROLL_VALUES)) {
        const fi = STAT_FIELD_MAP.get(key);
        if (!fi) continue;
        const bumped = { ...stats, [key]: (stats[key] || 0) + rollValue };
        const bumpedDps = calculateOutput(bumped, weaponType);
        const improvement = (bumpedDps / currentDps) - 1;
        gains.push({ key, label: fi.label, emoji: fi.emoji, improvement });
    }

    // Tìm min positive improvement cho 词条领先度
    const positiveGains = gains.filter(g => g.improvement > 0.0001);
    const minImprovement = positiveGains.length > 0
        ? Math.min(...positiveGains.map(g => g.improvement))
        : 1;

    for (const g of gains) {
        g.affixLead = g.improvement > 0.0001
            ? (g.improvement / minImprovement) - 1
            : null; // 垃圾
    }

    gains.sort((a, b) => b.improvement - a.improvement);
    return gains;
}

/**
 * Render full stats card PNG — thay thế embed hoàn toàn
 * Bao gồm: Header, Stats, Priority Bar Chart
 */
function renderStatsCard(doc, weaponCfg, username, analysis) {
    const s = doc.stats;
    const dps = calculateOutput(s, doc.weaponType);

    // ── Prepare stat lines ──
    const useful = analysis.filter(g => g.improvement > 0.0001);
    const trash = analysis.filter(g => g.improvement <= 0.0001);
    const top10 = useful.slice(0, 10);

    // Short labels cho chart (tránh cắt chữ)
    const SHORT_LABELS = {
        minAtk: 'Min ATK', maxAtk: 'Max ATK',
        precision: 'Precision', criti: 'Crit Rate', dirCriti: 'Direct Crit',
        critiDmg: 'Crit DMG', affinity: 'Affinity', dirAffinity: 'Direct Affinity',
        affinityDmg: 'Affinity DMG', minAttri: 'Min Attri.', maxAttri: 'Max Attri.',
        phyPen: 'Phy Penetration', phyDmg: 'Phy DMG Bonus',
        attriPen: 'Attri Penetration', attriDmg: 'Attri DMG Bonus',
        bossDmg: 'Boss DMG', weaponBoost: 'Weapon Boost',
        allWeaponBoost: 'All Weapon Boost', mysticBoost: 'Mystic Boost',
        mysticAreaBoost: 'Area Mystic Boost',
    };

    // ── Canvas sizing ──
    const W = 650;
    const barH = 28, barGap = 4;
    const headerH = 70;
    const chartHeaderH = 48;
    const chartH = top10.length * (barH + barGap) + (trash.length > 0 ? 24 : 0) + 16;
    const totalH = headerH + chartHeaderH + chartH + 30;

    const canvas = createCanvas(W, totalH);
    const ctx = canvas.getContext('2d');

    // ── Background ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, totalH);
    bgGrad.addColorStop(0, '#0f0f1a');
    bgGrad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, totalH);

    // ── Header ──
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`${weaponCfg.emoji} ${weaponCfg.name}`, 20, 30);
    ctx.fillStyle = '#aaa';
    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillText(username, 20, 50);
    // DPS badge
    ctx.fillStyle = '#00d4aa';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    const dpsText = `${weaponCfg.dpsLabel}: ${dps.toLocaleString()}`;
    const dpsW = ctx.measureText(dpsText).width;
    ctx.fillText(dpsText, W - dpsW - 20, 35);
    ctx.fillStyle = '#666';
    ctx.font = '10px "Segoe UI", Arial, sans-serif';
    ctx.fillText('(no skill multipliers)', W - ctx.measureText('(no skill multipliers)').width - 20, 52);

    // Separator
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, headerH - 4);
    ctx.lineTo(W - 20, headerH - 4);
    ctx.stroke();

    let y = headerH + 10;

    // ── Priority chart header ──
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Nên ưu tiên dòng (stat) nào tiếp theo?', 20, y + 16);
    y += 30;

    // Subtitle giải thích chi tiết
    ctx.fillStyle = '#888';
    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    if (top10.length > 0) {
        const topStat = top10[0];
        const pct = (topStat.improvement * 100).toFixed(2);
        const rollVal = AFFIX_ROLL_VALUES[topStat.key] || 0;
        const rollStr = rollVal >= 1 ? `tăng ${rollVal}` : `tăng ${(rollVal * 100).toFixed(1)}%`;
        const topName = SHORT_LABELS[topStat.key] || topStat.label;
        const explanation = `💡 Giải thích: Ví dụ nếu tăng thêm ${rollStr} ${topName}, thì ${weaponCfg.dpsLabel} tổng của bạn sẽ tăng +${pct}%`;
        ctx.fillText(explanation, 20, y);
    } else {
        ctx.fillText('💡 Giải thích: Sự gia tăng phần trăm nếu bạn thêm 1 dòng phụ tương ứng.', 20, y);
    }

    y += chartHeaderH - 30;

    // ── Priority bars (top 10) ──
    if (top10.length > 0) {
        const maxImp = top10[0].improvement;
        const padLeft = 200, padRight = 80;
        const barAreaW = W - padLeft - padRight;

        top10.forEach((g, idx) => {
            const barW = maxImp > 0 ? (g.improvement / maxImp) * barAreaW : 0;
            const rank = idx + 1;

            // Rank + Label + affix roll value
            const tierColor = rank <= 3 ? '#00ff88' : rank <= 6 ? '#48bfe3' : '#999';
            const tierIcon = rank <= 3 ? '▸' : ' ';
            ctx.fillStyle = tierColor;
            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${tierIcon}#${rank}`, 20, y + barH - 8);
            // Label
            const rollVal = AFFIX_ROLL_VALUES[g.key] || 0;
            const rollStr = rollVal >= 1 ? `+${rollVal}` : `+${(rollVal * 100).toFixed(1)}%`;
            ctx.fillStyle = '#d0d0d0';
            ctx.font = '11px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${SHORT_LABELS[g.key] || g.label} (${rollStr})`, 60, y + barH - 8);

            // Bar bg
            ctx.fillStyle = '#2a2a40';
            ctx.beginPath();
            ctx.roundRect(padLeft, y + 3, barAreaW, barH - 6, 4);
            ctx.fill();

            // Bar fill
            const grad = ctx.createLinearGradient(padLeft, y, padLeft + barW, y);
            if (rank <= 3) {
                grad.addColorStop(0, '#00d4aa'); grad.addColorStop(1, '#00ff88');
            } else if (rank <= 6) {
                grad.addColorStop(0, '#3a86ff'); grad.addColorStop(1, '#48bfe3');
            } else {
                grad.addColorStop(0, '#555580'); grad.addColorStop(1, '#7777aa');
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(padLeft, y + 3, Math.max(barW, 4), barH - 6, 4);
            ctx.fill();

            // Value
            const pct = (g.improvement * 100).toFixed(2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`+${pct}%`, padLeft + barW + 6, y + barH - 9);

            y += barH + barGap;
        });
    }

    // Trash
    if (trash.length > 0) {
        ctx.fillStyle = '#555';
        ctx.font = '10px "Segoe UI", Arial, sans-serif';
        const trashNames = trash.map(g => SHORT_LABELS[g.key] || g.label.split('(')[0].trim()).slice(0, 6).join(', ');
        ctx.fillText(`Không hiệu quả: ${trashNames}${trash.length > 6 ? '...' : ''}`, 20, y + 12);
    }

    return canvas.toBuffer('image/png');
}


// ===========================================================================
// TÍNH TOÁN DPS (Expected Normal — theo 伤害公式)
// 造成伤害 = 原始伤害 × 穿透区 × 增伤区 × 会心/会意 weighting
// 穿透区 = (pen-res)/200, nếu >0 thì /100
// Crit+Affinity>100% → affinity ép crit: effectiveCrit = P×(1-A)
// ===========================================================================
function calculateDPS(stats) {
    const s = stats;

    // ── Penetration zones (game: (pen-res)/200, nếu dương thì /100) ──
    const phyPenDiff = (s.phyPen || 0);      // vs 0 resistance (PvE default)
    const attriPenDiff = (s.attriPen || 0) - 6.8;  // vs 6.8 attri resistance (lv85 boss)
    const phyPenZone = 1 + (phyPenDiff > 0 ? phyPenDiff / 100 : phyPenDiff / 200);
    const attriPenZone = 1 + (attriPenDiff > 0 ? attriPenDiff / 100 : attriPenDiff / 200);

    // ── Raw damage parts ──
    const minPhy = (s.minAtk || 0) * phyPenZone * (1 + (s.phyDmg || 0));
    const maxPhy = (s.maxAtk || 0) * phyPenZone * (1 + (s.phyDmg || 0));
    const minAttri = (s.minAttri || 0) * attriPenZone * (1 + (s.attriDmg || 0));
    const maxAttri = (s.maxAttri || 0) * attriPenZone * (1 + (s.attriDmg || 0));

    // ── DMG boost zone (增伤区 — additive within, multiplicative with others) ──
    const dmgBoost = 1 + (s.bossDmg || 0) + (s.weaponBoost || 0)
        + (s.allWeaponBoost || 0) + (s.mysticBoost || 0) + (s.mysticAreaBoost || 0);

    // ── Damage values ──
    const minDmg = (minPhy + minAttri) * dmgBoost;
    const maxDmg = (maxPhy + maxAttri) * dmgBoost;
    const baseDmg = (minDmg + maxDmg) / 2;

    // ── Affinity damage (取最大攻击 × (1 + affinityDmg)) ──
    const affDmg = maxDmg * (1 + (s.affinityDmg || 0));

    // ── Hit rates ──
    const P = Math.min(s.precision || 0, 1);
    const A = Math.min((s.affinity || 0) + (s.dirAffinity || 0), 1);
    const rawC = Math.min((s.criti || 0) + (s.dirCriti || 0), 1);
    const CD = s.critiDmg || 0;

    // Khi crit+affinity > 100%: affinity ép crit
    // effectiveCrit = P × C khi C+A ≤ 1, hoặc P × (1-A) khi C+A > 1
    const effectiveC = (rawC + A > 1) ? Math.max(0, 1 - A) : rawC;

    // ── Expected Normal ──
    // No precision: A → affDmg, (1-A) → minDmg (擦伤/abrasion)
    const noPrecision = A * affDmg + (1 - A) * minDmg;

    // Precision hit: A → affDmg, C → crit, rest → baseDmg
    const normalRatio = Math.max(0, 1 - A - effectiveC);
    const precisionHit = A * affDmg + effectiveC * baseDmg * (1 + CD) + normalRatio * baseDmg;

    return Math.round((1 - P) * noPrecision + P * precisionHit);
}

// ===========================================================================
// TÍNH TOÁN HPS (theo 伤害公式 mục 十、治疗相关)
// - Precision/Affinity/Abrasion VÔ HIỆU, mặc định P=100%, chỉ Crit/Non-Crit
// - 外系属攻无效, chỉ tính 外攻(Physical ATK) + 牵丝(Attribute Healing)
// - ±10% dao động heal (dùng avg)
// ===========================================================================
function calculateHPS(stats) {
    const s = stats;

    // ── Base heal: Physical Attack + Attribute Healing (không dùng Attribute Attack) ──
    const avgAtk = ((s.minAtk || 0) + (s.maxAtk || 0)) / 2;
    const avgHeal = ((s.minHeal || 0) + (s.maxHeal || 0)) / 2;
    const baseHeal = avgAtk + avgHeal;
    if (baseHeal === 0) return 0;

    // ── Heal boost ──
    const healBoost = 1 + (s.phyHealBonus || 0) + (s.attriHealBonus || 0);
    const totalHeal = baseHeal * healBoost;

    // ── Crit only (P=100%, A=0, chỉ có Crit và Non-Crit) ──
    const C = Math.min((s.criti || 0) + (s.dirCriti || 0), 1);
    const CD = s.critHealBonus || 0;

    // Expected = base × (1 + C × critHealBonus)
    return Math.round(totalHeal * (1 + C * CD));
}

/** Chọn DPS hoặc HPS dựa vào weaponType */
function calculateOutput(stats, weaponType) {
    return weaponType === 'umbrella_heal' ? calculateHPS(stats) : calculateDPS(stats);
}

// ===========================================================================
// PARSE INPUT STRING "stat:value, stat:value, ..."
// ===========================================================================
const STAT_ALIASES = new Map([
    // minAtk
    ['minatk', 'minAtk'], ['min_atk', 'minAtk'], ['mina', 'minAtk'], ['minattack', 'minAtk'],
    // maxAtk
    ['maxatk', 'maxAtk'], ['max_atk', 'maxAtk'], ['maxa', 'maxAtk'], ['maxattack', 'maxAtk'],
    // precision
    ['precision', 'precision'], ['prec', 'precision'], ['baokick', 'precision'], ['bk', 'precision'], ['bao', 'precision'],
    // criti
    ['criti', 'criti'], ['crit', 'criti'], ['critirate', 'criti'], ['hoitam', 'criti'], ['cr', 'criti'],
    // dirCriti
    ['dircriti', 'dirCriti'], ['dir_criti', 'dirCriti'], ['directcriti', 'dirCriti'], ['dcriti', 'dirCriti'], ['dc', 'dirCriti'],
    // critiDmg
    ['critidmg', 'critiDmg'], ['crit_dmg', 'critiDmg'], ['critdmg', 'critiDmg'], ['cdmg', 'critiDmg'], ['hoitamdmg', 'critiDmg'],
    // affinity
    ['affinity', 'affinity'], ['aff', 'affinity'], ['hoiy', 'affinity'], ['af', 'affinity'],
    // dirAffinity
    ['diraffinity', 'dirAffinity'], ['dir_aff', 'dirAffinity'], ['daff', 'dirAffinity'], ['da', 'dirAffinity'],
    // affinityDmg
    ['affinitydmg', 'affinityDmg'], ['aff_dmg', 'affinityDmg'], ['affdmg', 'affinityDmg'], ['adm', 'affinityDmg'],
    // minAttri
    ['minattri', 'minAttri'], ['min_attri', 'minAttri'], ['minat', 'minAttri'], ['minattr', 'minAttri'],
    // maxAttri
    ['maxattri', 'maxAttri'], ['max_attri', 'maxAttri'], ['maxat', 'maxAttri'], ['maxattr', 'maxAttri'],
    // phyPen
    ['phypen', 'phyPen'], ['phy_pen', 'phyPen'], ['physpen', 'phyPen'], ['ppen', 'phyPen'], ['phypenetration', 'phyPen'],
    // phyDmg
    ['phydmg', 'phyDmg'], ['phy_dmg', 'phyDmg'], ['physdmg', 'phyDmg'], ['physbonus', 'phyDmg'],
    // attriPen
    ['attripen', 'attriPen'], ['attri_pen', 'attriPen'], ['apen', 'attriPen'], ['attrpen', 'attriPen'], ['attripenetration', 'attriPen'],
    // attriDmg
    ['attridmg', 'attriDmg'], ['attri_dmg', 'attriDmg'], ['atdmg', 'attriDmg'], ['attrdmg', 'attriDmg'],
    // bossDmg
    ['bossdmg', 'bossDmg'], ['boss_dmg', 'bossDmg'], ['boss', 'bossDmg'], ['bdmg', 'bossDmg'], ['bossbonus', 'bossDmg'],
    // weaponBoost
    ['weaponboost', 'weaponBoost'], ['weapon_boost', 'weaponBoost'], ['wboost', 'weaponBoost'], ['wb', 'weaponBoost'],
    // allWeaponBoost
    ['allweaponboost', 'allWeaponBoost'], ['all_weapon', 'allWeaponBoost'], ['awb', 'allWeaponBoost'], ['allweapon', 'allWeaponBoost'],
    // mysticBoost (Single-Target)
    ['mysticboost', 'mysticBoost'], ['mystic', 'mysticBoost'], ['mb', 'mysticBoost'], ['mysticskill', 'mysticBoost'],
    ['singlemystic', 'mysticBoost'], ['stmystic', 'mysticBoost'],
    // mysticAreaBoost (Area)
    ['mysticareaboost', 'mysticAreaBoost'], ['areamystic', 'mysticAreaBoost'], ['mab', 'mysticAreaBoost'],
    ['mysticarea', 'mysticAreaBoost'], ['areaskill', 'mysticAreaBoost'],
    // Healing stats
    ['minheal', 'minHeal'], ['min_heal', 'minHeal'], ['minhealing', 'minHeal'],
    ['maxheal', 'maxHeal'], ['max_heal', 'maxHeal'], ['maxhealing', 'maxHeal'],
    ['crithealbonus', 'critHealBonus'], ['critheal', 'critHealBonus'], ['chb', 'critHealBonus'], ['healcrit', 'critHealBonus'],
    ['phyhealbonus', 'phyHealBonus'], ['phyheal', 'phyHealBonus'], ['phb', 'phyHealBonus'],
    ['attrihealbonus', 'attriHealBonus'], ['attriheal', 'attriHealBonus'], ['ahb', 'attriHealBonus'],
]);

function parseStatsInput(input) {
    const result = {};
    const errors = [];

    for (const pair of input.split(/[,;]+/)) {
        const trimmed = pair.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^([a-zA-Z_ ]+)\s*[:=]\s*(-?[\d.]+)(%?)$/i);
        if (!match) {
            errors.push(`"${trimmed}" không đúng định dạng (dùng \`key:value\`)`);
            continue;
        }

        const rawKey = match[1].trim().toLowerCase().replace(/[\s_]+/g, '');
        let val = parseFloat(match[2]);
        const isPercentSuffix = match[3] === '%';

        const resolvedKey = STAT_ALIASES.get(rawKey); // O(1) Map lookup
        if (!resolvedKey) {
            errors.push(`"${match[1].trim()}" không phải stat hợp lệ`);
            continue;
        }

        const fi = STAT_FIELD_MAP.get(resolvedKey); // O(1) Map lookup
        if (fi?.isPercent) {
            // Có % suffix → luôn chia 100 (vd: 66.1% → 0.661)
            // Không có % suffix:
            //   - val > 1  → coi là số game (vd: 66.1 → 0.661)
            //   - val <= 1 → coi là đã decimal (vd: 0.7 → giữ 0.7)
            if (isPercentSuffix || val > 1) val /= 100;
        }

        result[resolvedKey] = val;
    }

    return { result, errors };
}

// ===========================================================================
// STAT GROUPS — 6 nhóm, mỗi nhóm ≤ 5 fields (giới hạn Modal Discord)
// customId sử dụng: "wwm_grp:{weapon}:{groupId}"
// ===========================================================================
const STAT_GROUPS = [
    {
        id: 'atk',
        label: '⚔️ ATK',
        fields: [
            { key: 'minAtk', label: 'Min Physical Attack', hint: 'Số trong game, vd: 925' },
            { key: 'maxAtk', label: 'Max Physical Attack', hint: 'Số trong game, vd: 1581' },
        ],
    },
    {
        id: 'crit',
        label: '💥 Crit',
        fields: [
            { key: 'precision', label: 'Precision Rate (Bạo Kích)', hint: 'Nhập số trong game, vd: 103.5 hoặc 103.5%' },
            { key: 'criti', label: 'Critical Rate (Hội Tâm)', hint: 'Nhập số trong game, vd: 66.1 hoặc 66.1%' },
            { key: 'dirCriti', label: 'Direct Critical Rate', hint: 'Nhập số trong game, vd: 4.6 hoặc 0' },
            { key: 'critiDmg', label: 'Critical DMG Bonus', hint: 'Nhập số trong game, vd: 57.9 hoặc 57.9%' },
        ],
    },
    {
        id: 'affinity',
        label: '✨ Affinity',
        fields: [
            { key: 'affinity', label: 'Affinity Rate (Hội Ý)', hint: 'Nhập số trong game, vd: 14.8 hoặc 14.8%' },
            { key: 'dirAffinity', label: 'Direct Affinity Rate', hint: 'Nhập số trong game, vd: 0.0 hoặc 4.6%' },
            { key: 'affinityDmg', label: 'Affinity DMG Bonus', hint: 'Nhập số trong game, vd: 35.0 hoặc 35%' },
        ],
    },
    {
        id: 'attri',
        label: '🌊 Attri.',
        fields: [
            { key: 'minAttri', label: 'Min Attribute Attack', hint: 'Số trong game, vd: 272' },
            { key: 'maxAttri', label: 'Max Attribute Attack', hint: 'Số trong game, vd: 542' },
            { key: 'attriPen', label: 'Attribute Attack Penetration', hint: 'Số trong game (lẻ được), vd: 13.2' },
            { key: 'phyPen', label: 'Physical Penetration', hint: 'Số trong game (lẻ được), vd: 15.4' },
        ],
    },
    {
        id: 'dmg',
        label: '💢 DMG Bonus',
        fields: [
            { key: 'phyDmg', label: 'Physical DMG Bonus', hint: 'Nhập số trong game, vd: 0 hoặc 5%' },
            { key: 'attriDmg', label: 'Attribute Attack DMG Bonus', hint: 'Nhập số trong game, vd: 6.6 hoặc 6.6%' },
            { key: 'bossDmg', label: 'DMG Boost Vs. Boss Units', hint: 'Nhập số trong game, vd: 0 hoặc 8%' },
        ],
    },
    {
        id: 'boost',
        label: '⚡ Boost',
        fields: [
            { key: 'weaponBoost', label: 'Specified Weapon Martial Art Boost', hint: 'Nhập số trong game, vd: 0 hoặc 5%' },
            { key: 'allWeaponBoost', label: 'All Martial Art Skill DMG Boost', hint: 'Nhập số trong game, vd: 3 hoặc 3%' },
            { key: 'mysticBoost', label: 'Single-Target Mystic DMG Boost', hint: 'Nhập số trong game, vd: 4.3 hoặc 4.3%' },
            { key: 'mysticAreaBoost', label: 'Area Mystic Skill DMG Boost', hint: 'Nhập số trong game, vd: 0 hoặc 3%' },
        ],
    },
    {
        id: 'heal',
        label: '💚 Healing',
        fields: [
            { key: 'minHeal', label: 'Min Attribute Healing', hint: 'Số trong game, vd: 272' },
            { key: 'maxHeal', label: 'Max Attribute Healing', hint: 'Số trong game, vd: 446' },
            { key: 'critHealBonus', label: 'Critical Healing Bonus', hint: 'Nhập số trong game, vd: 50 hoặc 50%' },
            { key: 'phyHealBonus', label: 'Physical Healing Bonus', hint: 'Nhập số trong game, vd: 0 hoặc 5%' },
            { key: 'attriHealBonus', label: 'Attri. Attack Healing Bonus', hint: 'Nhập số trong game, vd: 0 hoặc 5%' },
        ],
    },
];

const STAT_GROUP_MAP = new Map(STAT_GROUPS.map(g => [g.id, g]));

// ===========================================================================
// BUILDER HELPERS
// ===========================================================================

/** Build weapon select menu row */
function buildWeaponSelectRow() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('wwm_weapon_select')
            .setPlaceholder('🗡️ Chọn vũ khí của bạn...')
            .addOptions(
                WEAPON_CHOICES.map(c =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(c.name)
                        .setValue(c.value)
                )
            )
    );
}

/** Build ActionRows có group buttons — tự động chia 3 per row, lọc heal cho DPS */
function buildGroupButtonRows(weapon) {
    // Chỉ hiện nhóm Healing cho umbrella_heal
    const groups = weapon === 'umbrella_heal'
        ? STAT_GROUPS
        : STAT_GROUPS.filter(g => g.id !== 'heal');

    const rows = [];
    for (let i = 0; i < groups.length; i += 3) {
        rows.push(
            new ActionRowBuilder().addComponents(
                groups.slice(i, i + 3).map(g =>
                    new ButtonBuilder()
                        .setCustomId(`wwm_grp:${weapon}:${g.id}`)
                        .setLabel(g.label)
                        .setStyle(ButtonStyle.Secondary)
                )
            )
        );
    }
    return rows;
}

/**
 * Build modal cho 1 nhóm stat, pre-fill giá trị hiện tại nếu có.
 * @param {string} weapon
 * @param {object} group  - entry từ STAT_GROUPS
 * @param {object} currentStats - stats đã lưu trong DB (hoặc {})
 */
function buildGroupModal(weapon, group, currentStats) {
    const modal = new ModalBuilder()
        .setCustomId(`wwm_modal:${weapon}:${group.id}`)
        .setTitle(`${group.label} — ${WEAPON_CONFIG[weapon]?.name?.split(' ')[0] ?? weapon}`);

    const rows = group.fields.map(f => {
        const fi = STAT_FIELD_MAP.get(f.key);
        const cur = currentStats?.[f.key];
        // Pre-fill: chuyển giá trị DB → string hiển thị
        // Dùng != null (loose) để bắt cả undefined lẫn null,
        // nhưng VẪN hiển thị khi cur === 0 (ví dụ dirCriti, phyPen...)
        let prefill = '';
        if (cur != null) {
            prefill = fi?.isPercent ? `${(cur * 100).toFixed(2)}%` : String(cur);
        }
        return new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId(f.key)
                .setLabel(f.label)
                .setPlaceholder(f.hint)
                .setValue(prefill)
                .setStyle(TextInputStyle.Short)
                .setRequired(false) // Không bắt buộc — bỏ trống = giữ nguyên
        );
    });

    modal.addComponents(...rows);
    return modal;
}

// ===========================================================================
// WWM INTERACTION HANDLER (route từ interactionCreate.js)
// ===========================================================================

/**
 * xử lý StringSelectMenu 'wwm_weapon_select' — user đã chọn vũ khí
 * → edit message để hiện 6 button nhóm stat
 */
async function handleWwmWeaponSelect(interaction) {
    const weapon = interaction.values[0];
    const weaponCfg = WEAPON_CONFIG[weapon];
    if (!weaponCfg) return interaction.update({ content: '❌ Vũ khí không hợp lệ.', components: [] });

    const rows = buildGroupButtonRows(weapon);

    await interaction.update({
        content:
            `**${weaponCfg.emoji} ${weaponCfg.name}** đã chọn.\n` +
            `Chọn nhóm chỉ số cần nhập. Giá trị cũ sẽ được **pre-fill** sẵn.`,
        components: rows,
    });
}

/**
 * Xử lý Button 'wwm_grp:{weapon}:{groupId}' — user click vào 1 nhóm
 * → fetch stats hiện tại từ DB → show modal pre-filled
 */
async function handleWwmGroupButton(interaction) {
    const [, weapon, groupId] = interaction.customId.split(':');
    const group = STAT_GROUP_MAP.get(groupId);
    if (!group) return interaction.reply({ content: '❌ Group không hợp lệ.', flags: MessageFlags.Ephemeral });

    // Fetch stats hiện tại để pre-fill modal
    const doc = await WwmStats.findOne({ userId: interaction.user.id, weaponType: weapon }).lean();
    const currentStats = doc?.stats ?? {};

    const modal = buildGroupModal(weapon, group, currentStats);
    await interaction.showModal(modal);
}

/**
 * Xử lý Modal submit 'wwm_modal:{weapon}:{groupId}'
 * → parse fields → merge vào DB → followUp kết quả
 */
async function handleWwmModalSubmit(interaction) {
    const [, weapon, groupId] = interaction.customId.split(':');
    const group = STAT_GROUP_MAP.get(groupId);
    if (!group) return interaction.reply({ content: '❌ Group không hợp lệ.', flags: MessageFlags.Ephemeral });

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const newStats = {};
    const errors = [];

    for (const f of group.fields) {
        const raw = interaction.fields.getTextInputValue(f.key).trim();
        if (!raw) continue; // Bỏ trống = giữ nguyên

        // Reuse parseStatsInput logic với format "{key}:{value}"
        const { result, errors: errs } = parseStatsInput(`${f.key}:${raw}`);
        Object.assign(newStats, result);
        errors.push(...errs);
    }

    if (Object.keys(newStats).length === 0 && errors.length === 0) {
        return interaction.editReply('ℹ️ Không có giá trị nào thay đổi.');
    }

    // Merge vào DB: chỉ update các field mới, giữ nguyên field cũ
    const setPayload = {};
    for (const [k, v] of Object.entries(newStats)) {
        setPayload[`stats.${k}`] = v;
    }

    await WwmStats.findOneAndUpdate(
        { userId: interaction.user.id, weaponType: weapon },
        { $set: setPayload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Hiển thị kết quả
    const savedLines = group.fields
        .filter(f => newStats[f.key] !== undefined)
        .map(f => {
            const fi = STAT_FIELD_MAP.get(f.key);
            const val = fi?.isPercent ? `${(newStats[f.key] * 100).toFixed(2)}%` : String(newStats[f.key]);
            return `\`${fi?.label ?? f.key}\`: **${val}**`;
        });

    let reply = savedLines.length > 0
        ? `✅ Đã lưu **${group.label}**:\n${savedLines.join('\n')}`
        : '';

    if (errors.length > 0) {
        reply += `\n\n⚠️ Lỗi parse:\n${errors.map(e => `• ${e}`).join('\n')}`;
    }

    return interaction.editReply(reply || '❌ Không có dữ liệu hợp lệ.');
}

// ===========================================================================
// FORMAT GIÁ TRỊ  — dùng v14 Formatters cho markdown
// ===========================================================================
function fmt(val, isPercent) {
    if (val === undefined || val === null) return '0';
    if (isPercent) return `${(val * 100).toFixed(2)}%`;
    return (val % 1 === 0) ? String(val) : val.toFixed(2);
}

function getDiffStr(userVal, baseVal, isPercent) {
    const diff = userVal - baseVal;
    if (Math.abs(diff) < 0.00001) return inlineCode('=');
    const sign = diff > 0 ? '+' : '';
    const dispDiff = isPercent ? `${sign}${(diff * 100).toFixed(2)}%` : `${sign}${diff.toFixed(2)}`;
    return `${diff > 0 ? '🟢' : '🔴'} ${inlineCode(dispDiff)}`;
}

// v14: helper dùng MessageFlags.Ephemeral thay vì magic number 64
function ephemeral(content) {
    return { content, flags: MessageFlags.Ephemeral };
}

// v14: dùng time() formatter từ discord.js thay vì template string thủ công
function relativeTimestamp(date) {
    if (!date) return 'N/A';
    return time(Math.floor(date.getTime() / 1000), TimestampStyles.RelativeTime);
}

// ===========================================================================
// BUILD EMBED CHI TIẾT
// ===========================================================================
function buildStatsEmbed(doc, weaponCfg, username, avatarUrl) {
    const s = doc.stats;
    const userDps = calculateOutput(s, doc.weaponType);

    const embed = new EmbedBuilder()
        .setColor(weaponCfg.color)
        .setTitle(`${weaponCfg.emoji} ${weaponCfg.name}`)
        .setAuthor({ name: `📊 Stats Lv.85 — ${username}`, iconURL: avatarUrl })
        .setDescription(
            `${bold(weaponCfg.dpsLabel + ':')} ${inlineCode(userDps.toLocaleString())}\n` +
            `> ⚠️ ${italic('Tương đối — không tính skill multipliers, rotations hay hồi chiêu.')}`
        );

    const groups = [
        { name: '⚔️ ATK', keys: ['minAtk', 'maxAtk'] },
        { name: '💥 Crit', keys: ['precision', 'criti', 'dirCriti', 'critiDmg'] },
        { name: '✨ Affinity (Hội Ý)', keys: ['affinity', 'dirAffinity', 'affinityDmg'] },
        { name: '🌊 Thuộc Tính', keys: ['minAttri', 'maxAttri'] },
        { name: '🗡️ Xuyên Giáp & Bonus DMG', keys: ['phyPen', 'phyDmg', 'attriPen', 'attriDmg', 'bossDmg', 'weaponBoost', 'allWeaponBoost', 'mysticBoost'] },
    ];

    for (const grp of groups) {
        const lines = grp.keys
            .map(key => {
                const fi = STAT_FIELD_MAP.get(key);
                if (!fi) return null;
                const u = s[key] ?? 0;
                if (u === 0) return null;
                return `${fi.emoji} ${bold(fi.label)}: ${inlineCode(fmt(u, fi.isPercent))}`;
            })
            .filter(Boolean);

        if (lines.length > 0) {
            embed.addFields({ name: grp.name, value: lines.join('\n'), inline: false });
        }
    }

    // ── Analysis chart (canvas) ──
    const analysis = calculateAnalysis(s, doc.weaponType);
    let chartBuffer = null;
    if (analysis.length > 0) {
        chartBuffer = renderAnalysisChart(analysis, weaponCfg);
        if (chartBuffer) {
            embed.setImage('attachment://stat_priority.png');
        }
    }

    embed
        .addFields({ name: '🕐 Cập nhật', value: relativeTimestamp(doc.updatedAt), inline: true })
        .setFooter({ text: 'WWM Tuning Tool lv85 · +% = DPS gain per affix roll · Lead = so với stat yếu nhất' })
        .setTimestamp();

    return { embed, chartBuffer };
}

// ===========================================================================
// SLASH COMMAND SETUP
// Helper addWeaponOption để DRY — không copy-paste 4 lần
// ===========================================================================
function addWeaponOption(opt, required = false) {
    return opt
        .setName('weapon')
        .setDescription(required ? 'Loại vũ khí' : 'Loại vũ khí (bỏ qua để xem vũ khí gần nhất)')
        .setRequired(required)
        .addChoices(...WEAPON_CHOICES);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wwm-stats')
        .setDescription('Nhập/xem chỉ số nhân vật WWM lv85 và tính DPS/HPS')
        .addSubcommand(sub => sub
            .setName('set')
            .setDescription('Nhập hoặc cập nhật stats cho vũ khí của bạn (Interactive UI)')
        )
        .addSubcommand(sub => sub
            .setName('view')
            .setDescription('Xem stats và so sánh với baseline')
            .addStringOption(opt => addWeaponOption(opt, false))
        )
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Xem tất cả vũ khí bạn đã nhập stats')
        )
        .addSubcommand(sub => sub
            .setName('help')
            .setDescription('Xem hướng dẫn nhập stats và danh sách key hợp lệ')
        ),

    category: '🎮 Game (WWM)',
    cooldown: 5,

    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'set': return handleSet(interaction);
            case 'view': return handleView(interaction);

            case 'list': return handleList(interaction);
            case 'help': return handleHelp(interaction);
        }
    }
};

// Export các handler cho interactionCreate.js route vào
module.exports.handleWwmWeaponSelect = handleWwmWeaponSelect;
module.exports.handleWwmGroupButton = handleWwmGroupButton;
module.exports.handleWwmModalSubmit = handleWwmModalSubmit;

// ===========================================================================
// HANDLER: help  (Components v2)
// ===========================================================================
async function handleHelp(interaction) {
    const container = new ContainerBuilder()
        // ── Block 1: Cách dùng /wwm-stats set (Interactive UI) ──
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '## 📖 Hướng dẫn /wwm-stats\n\n' +
                '### 📊 Nhập stats — `/wwm-stats set`\n' +
                'Gõ lệnh và làm theo các bước:\n' +
                '**Bước 1** — Chọn vũ khí từ dropdown menu\n' +
                '**Bước 2** — Chọn nhóm chỉ số cần nhập (ATK / Crit / Affinity / Attri. / DMG Bonus / Boost / Healing)\n' +
                '**Bước 3** — Điền giá trị vào form. Giá trị cũ sẽ được **pre-fill sẵn**.\n' +
                '**Bước 4** — Submit. Bot tự động **merge** với data cũ, chỉ update chỉ số bạn đã nhập.'
            )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        // ── Block 2: Vũ khí hỗ trợ ──
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '### 🗡️ Vũ khí hỗ trợ\n' +
                WEAPON_CHOICES.map(c => `• ${c.name}`).join('\n')
            )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        // ── Block 3: Các lệnh khác + lưu ý ──
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '### 🔧 Các lệnh khác\n' +
                '`/wwm-stats view` — Xem stats chi tiết + định hướng stat tiếp theo\n' +
                '`/wwm-stats list` — Danh sách tất cả vũ khí đã lưu\n\n' +
                '### ⚠️ Lưu ý khi nhập\n' +
                '\u2022 Nhập **đúng số hiển thị trong game** — vd: Critical Rate `66.1%` thì nhập `66.1` hoặc `66.1%`\n' +
                '\u2022 Stats số (ATK, Attri., Penetration...): nhập trực tiếp, vd: `1800`, `13.2`\n' +
                '\u2022 Bỏ trống = giữ nguyên giá trị cũ, không cần nhập lại\n' +
                '\u2022 DPS tính toán là tương đối, không tính rotations/cooldowns'
            )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '-# Where Winds Meet · Arya Bot · Dùng /wwm-stats set để nhập stats qua Interactive UI'
            )
        );

    await interaction.reply({
        components: [container],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
}



// ===========================================================================
// HANDLER: set  — Bước 1: Show weapon select menu
// Bước 2-4 chạy qua handleWwmWeaponSelect / handleWwmGroupButton / handleWwmModalSubmit
// ===========================================================================
async function handleSet(interaction) {
    const row = buildWeaponSelectRow();
    return interaction.reply({
        content: '🗡️ **Chọn vũ khí** để nhập stats:',
        components: [row],
        flags: MessageFlags.Ephemeral,
    });
}

// Legacy text-based set (giữ lại để dùng trong interactionCreate nếu cần)
async function handleSetLegacy(interaction) {
    await interaction.deferReply();

    const weaponType = interaction.options.getString('weapon');
    const statsInput = interaction.options.getString('stats');
    const userId = interaction.user.id;
    const weaponCfg = WEAPON_CONFIG[weaponType];

    const { result: newStats, errors } = parseStatsInput(statsInput);

    if (Object.keys(newStats).length === 0) {
        return interaction.editReply(
            `❌ Không nhận được stats hợp lệ!\n` +
            (errors.length > 0 ? `${bold('Lỗi parse:')}\n- ${errors.join('\n- ')}\n\n` : '') +
            `Dùng ${inlineCode('/wwm-stats help')} để xem hướng dẫn và danh sách key hợp lệ.`
        );
    }

    try {
        // Dùng findOneAndUpdate với upsert để atomic merge — tốt hơn find rồi save
        const setFields = {};
        for (const [key, val] of Object.entries(newStats)) {
            setFields[`stats.${key}`] = val;
        }
        const doc = await WwmStats.findOneAndUpdate(
            { userId, weaponType },
            { $set: setFields },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const updatedLines = Object.entries(newStats)
            .map(([key, val]) => {
                const fi = STAT_FIELD_MAP.get(key);
                return fi ? `${fi.emoji} ${bold(fi.label)}: ${inlineCode(fmt(val, fi.isPercent))}` : null;
            })
            .filter(Boolean).join('\n');

        const userDps = calculateOutput(doc.stats, weaponType);
        const baseDps = calculateOutput(weaponCfg.baseline, weaponType);
        const diffPct = baseDps !== 0 ? (((userDps - baseDps) / baseDps) * 100).toFixed(1) : '0';
        const diffSign = userDps >= baseDps ? '+' : '';

        const embed = new EmbedBuilder()
            .setColor(weaponCfg.color)
            .setTitle(`✅ Đã lưu stats — ${weaponCfg.emoji} ${weaponCfg.name}`)
            .setDescription(
                `${bold('Stats vừa cập nhật:')}\n${updatedLines}` +
                (errors.length > 0 ? `\n\n⚠️ ${bold('Bỏ qua (lỗi):')}\n- ${errors.join('\n- ')}` : '')
            )
            .addFields({
                name: `📊 ${weaponCfg.dpsLabel} hiện tại`,
                value: `${inlineCode(userDps.toLocaleString())}\n${italic(`Baseline: ${inlineCode(baseDps.toLocaleString())} · So sánh: ${userDps >= baseDps ? '🟢' : '🔴'} ${inlineCode(diffSign + diffPct + '%')}`)}`,
                inline: false
            })
            .setFooter({ text: 'Dùng /wwm-stats view để xem chi tiết.' })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });

    } catch (err) {
        console.error('[wwm-stats set error]', err);
        return interaction.editReply('❌ Có lỗi khi lưu stats. Vui lòng thử lại.');
    }
}

// ===========================================================================
// HANDLER: view
// ===========================================================================
async function handleView(interaction) {
    await interaction.deferReply();

    const targetUser = interaction.user;
    const userId = targetUser.id;
    const weaponChoice = interaction.options.getString('weapon');

    try {
        const doc = weaponChoice
            ? await WwmStats.findOne({ userId, weaponType: weaponChoice }).lean()
            : await WwmStats.findOne({ userId }).sort({ updatedAt: -1 }).lean();

        if (!doc) {
            const hint = weaponChoice
                ? `Không tìm thấy stats ${bold(WEAPON_CONFIG[weaponChoice]?.name ?? weaponChoice)} của ${userMention(userId)}.`
                : `${userMention(userId)} chưa nhập stats nào.`;
            return interaction.editReply(`❌ ${hint}\nDùng ${inlineCode('/wwm-stats set')} để nhập.`);
        }

        const weaponCfg = WEAPON_CONFIG[doc.weaponType];
        const username = targetUser.displayName || targetUser.username;
        const analysis = calculateAnalysis(doc.stats, doc.weaponType);
        const cardBuffer = renderStatsCard(doc, weaponCfg, username, analysis);
        const file = new AttachmentBuilder(cardBuffer, { name: 'wwm_stats.png' });
        return interaction.editReply({ files: [file] });

    } catch (err) {
        console.error('[wwm-stats view error]', err);
        return interaction.editReply('❌ Có lỗi khi tải stats. Vui lòng thử lại.');
    }
}

// ===========================================================================
// HANDLER: list
// ===========================================================================
async function handleList(interaction) {
    await interaction.deferReply();

    const targetUser = interaction.user;
    const userId = targetUser.id;
    const username = targetUser.displayName || targetUser.username;
    const avatarUrl = targetUser.displayAvatarURL({ size: 64, extension: 'webp' });

    try {
        // .lean() để trả về plain object, nhanh hơn Mongoose Document cho read-only
        const docs = await WwmStats.find({ userId }).sort({ updatedAt: -1 }).lean();

        if (docs.length === 0) {
            return interaction.editReply(
                `❌ ${userMention(userId)} chưa có dữ liệu stats nào.\nDùng ${inlineCode('/wwm-stats set')} để nhập.`
            );
        }

        const lines = docs
            .map(doc => {
                const cfg = WEAPON_CONFIG[doc.weaponType];
                if (!cfg) return null;
                const dps = calculateOutput(doc.stats, doc.weaponType);
                const baseDps = calculateOutput(cfg.baseline, doc.weaponType);
                const diff = baseDps !== 0 ? (((dps - baseDps) / baseDps) * 100).toFixed(1) : '0';
                const sign = dps >= baseDps ? '+' : '';
                const updated = relativeTimestamp(doc.updatedAt);
                return `${cfg.emoji} ${bold(cfg.name)}\n  └ ${cfg.dpsLabel}: ${inlineCode(dps.toLocaleString())} ${dps >= baseDps ? '🟢' : '🔴'} ${inlineCode(sign + diff + '%')} vs base · ${updated}`;
            })
            .filter(Boolean).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`📋 Stats của ${username}`)
            .setAuthor({ name: username, iconURL: avatarUrl })
            .setDescription(lines)
            .setFooter({ text: `${docs.length} vũ khí có dữ liệu · /wwm-stats view để xem chi tiết` })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });

    } catch (err) {
        console.error('[wwm-stats list error]', err);
        return interaction.editReply('❌ Có lỗi khi tải danh sách. Vui lòng thử lại.');
    }
}
