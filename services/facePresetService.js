// services/facePresetService.js
// Shared logic: QR decode → API fetch → DB cache → Embed build → Forum archive
// Dùng chung cho cả slash command /face-converter lẫn context menu "Convert Face Preset"

const axios = require('axios');
const { Jimp } = require('jimp');
const QrCodeReader = require('qrcode-reader');
const { EmbedBuilder, ChannelType, italic, codeBlock } = require('discord.js');
const { FacePreset, GuildConfig } = require('../db/schemas');
const { formatNumber } = require('../utils/formatters');

/**
 * Giải mã QR Code từ URL ảnh
 * @param {string} imageUrl
 * @returns {string|null} Nội dung QR hoặc null
 */
async function decodeQR(imageUrl) {
    try {
        const image = await Jimp.read(imageUrl);
        const qr = new QrCodeReader();

        return await new Promise((resolve) => {
            qr.callback = (err, value) => {
                if (err) return resolve(null);
                resolve(value.result);
            };
            qr.decode(image.bitmap);
        });
    } catch (err) {
        console.error('[FacePresetService] QR decode error:', err.message);
        return null;
    }
}

/**
 * Parse finalId từ raw input (có thể là URL chứa id=xxx hoặc ID trực tiếp)
 * @param {string} raw
 * @returns {string}
 */
function parsePresetId(raw) {
    let id = raw;
    if (id.includes('id=')) {
        const parts = id.split('id=');
        if (parts.length > 1) id = parts[1].split('&')[0];
    }
    return id.trim();
}

/**
 * Fetch preset data từ DB cache hoặc API
 * @param {string} finalId
 * @returns {{ data: object, presetData: object }|null}
 */
async function fetchPresetData(finalId) {
    // Database Cache
    let presetData = await FacePreset.findOne({ id: finalId }).lean();
    let data;

    if (presetData) {
        data = presetData.data;
    } else {
        const response = await axios.get(`${process.env.WWM_LOCAL_API}/convert`, {
            params: { id: finalId },
            timeout: 10_000,
        });
        const responseBody = response.data;

        // Handle wrapped response from local API
        if (responseBody && responseBody.origin) {
            data = responseBody.origin;
        } else {
            data = responseBody;
        }

        if (!data || !data.view_data) return null;
        presetData = await FacePreset.create({ id: finalId, data });
    }

    return { data, presetData };
}

/**
 * Parse view_data và lấy face_data
 * @param {object} data - Raw preset data
 * @returns {{ viewData: object, faceData: string }|null}
 */
function parseFaceData(data) {
    let viewData;
    try {
        viewData = typeof data.view_data === 'string' ? JSON.parse(data.view_data) : data.view_data;
    } catch {
        return null;
    }

    const faceData = viewData.face_data;
    if (!faceData) return null;

    return { viewData, faceData };
}

/**
 * Build embeds từ preset data
 * @param {object} data - Raw preset data
 * @param {object} viewData - Parsed view data
 * @param {string} faceData - Face data string
 * @param {string} finalId - ID preset
 * @param {import('discord.js').Client} client - Bot client (cho avatar footer)
 * @param {object} opts - Options
 * @param {boolean} opts.includeExtraData - Include skeleton/makeup data (cho slash command)
 * @returns {EmbedBuilder[]}
 */
function buildPresetEmbeds(data, viewData, faceData, finalId, client, opts = {}) {
    const { includeExtraData = false } = opts;

    const embedInfo = new EmbedBuilder()
        .setTitle(data.name || 'Unknown')
        .setDescription(italic(data.msg || 'Không có mô tả'))
        .addFields(
            { name: '🔥 Độ hot', value: formatNumber(data.heat_val), inline: true },
            { name: '✨ Yêu thích', value: formatNumber(data.like_num), inline: true },
            { name: '👤 Host ID', value: `${data.hostnum || 'N/A'}`, inline: true }
        )
        .setColor('#1a1a1a')
        .setTimestamp()
        .setFooter({ text: `Plan ID: ${data.plan_id || finalId}`, iconURL: client.user.displayAvatarURL() });

    if (data.picture_url) embedInfo.setImage(data.picture_url);

    // Build face code string
    let fullPresetStr = faceData;
    if (includeExtraData) {
        const extraData = {};
        if (viewData.face_skeleton_data) extraData.face_skeleton_data = viewData.face_skeleton_data;
        if (viewData.face_makeup_data) extraData.face_makeup_data = viewData.face_makeup_data;
        if (Object.keys(extraData).length > 0) {
            fullPresetStr += ' ' + JSON.stringify(extraData);
        }
    }

    const fullPresetText = fullPresetStr.length > 4000 ? fullPresetStr.substring(0, 4000) + '...' : fullPresetStr;

    const embedCode = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setTitle('📋 Preset Data')
        .setDescription(codeBlock(fullPresetText));

    return [embedInfo, embedCode];
}

/**
 * Tự động lưu preset vào Forum channel (nếu cấu hình)
 * @param {string} guildId
 * @param {string} finalId
 * @param {object} presetData - Mongoose document
 * @param {EmbedBuilder[]} embeds
 * @param {import('discord.js').Client} client
 */
async function autoArchiveForum(guildId, finalId, presetData, embeds, client) {
    try {
        const config = await GuildConfig.findOne({ guildId }).lean();
        if (!config?.faceForumId) return;

        if (presetData.postedChannels?.includes(config.faceForumId)) return;

        const forum = await client.channels.fetch(config.faceForumId).catch(() => null);
        if (!forum || forum.type !== ChannelType.GuildForum) return;

        const name = (presetData.data?.name || 'Preset').substring(0, 100);
        await forum.threads.create({
            name,
            message: { embeds },
        });

        await FacePreset.updateOne(
            { id: finalId },
            { $addToSet: { postedChannels: config.faceForumId } }
        );
        console.log(`[Auto-Archive] Thành công: ${name}`);
    } catch (err) {
        console.error('[Auto-Archive] Error:', err.message);
    }
}

module.exports = {
    decodeQR,
    parsePresetId,
    fetchPresetData,
    parseFaceData,
    buildPresetEmbeds,
    autoArchiveForum,
};
