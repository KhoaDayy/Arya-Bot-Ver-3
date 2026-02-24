const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const { Jimp } = require("jimp");
const QrCodeReader = require("qrcode-reader");
const { FacePreset, GuildConfig } = require("../../db/schemas");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("face-converter")
        .setDescription("Chuyển đổi preset WWM từ Mã ID hoặc QR Code")
        .addStringOption(option =>
            option.setName("code")
                .setDescription("Nhập mã ID hoặc dán URL preset")
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName("qr")
                .setDescription("Tải lên ảnh chứa mã QR")
                .setRequired(false)),
    category: "🎮 Game (WWM)",
    async execute(interaction) {
        await interaction.deferReply();

        try {
            let inputCode = interaction.options.getString("code");
            const imageAttachment = interaction.options.getAttachment("qr");
            console.log(`[Face-Converter] Request by ${interaction.user.tag} | Code: ${inputCode} | HasImage: ${!!imageAttachment}`);
            let finalId = null;

            if (!inputCode && !imageAttachment) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({ content: "❌ Bạn cần cung cấp mã preset hoặc tải lên ảnh QR Code.", ephemeral: true });
            }

            // 1. Giải mã QR Code cục bộ
            if (imageAttachment) {
                try {
                    const image = await Jimp.read(imageAttachment.url);
                    const qr = new QrCodeReader();

                    const decodedData = await new Promise((resolve) => {
                        qr.callback = (err, value) => {
                            if (err) return resolve(null);
                            resolve(value.result);
                        };
                        qr.decode(image.bitmap);
                    });

                    if (decodedData) {
                        finalId = decodedData;
                        console.log(`[Face-Converter] QR Decoded ID: ${decodedData}`);
                    } else if (!inputCode) {
                        await interaction.deleteReply().catch(() => { });
                        return interaction.followUp({
                            content: `❌ Bot không thể nhận diện mã QR trong ảnh này.\n💡 **Mẹo:** Hãy đảm bảo ảnh rõ nét và không bị cắt mất phần góc mã QR.`,
                            ephemeral: true
                        });
                    }
                } catch (qrErr) {
                    if (!inputCode) {
                        await interaction.deleteReply().catch(() => { });
                        return interaction.followUp({ content: "❌ Đã xảy ra lỗi khi xử lý ảnh QR.", ephemeral: true });
                    }
                }
            }

            if (!finalId) finalId = inputCode;
            if (!finalId) return;

            if (finalId.includes("id=")) {
                const parts = finalId.split("id=");
                if (parts.length > 1) finalId = parts[1].split("&")[0];
            }
            finalId = finalId.trim();
            console.log(`[Face-Converter] Final Target ID: ${finalId}`);

            // 2. Database Cache
            let presetData = await FacePreset.findOne({ id: finalId }).lean();
            let data;

            if (presetData) {
                console.log(`[Face-Converter] Cache HIT for ${finalId}`);
                data = presetData.data;
            } else {
                console.log(`[Face-Converter] Cache MISS for ${finalId}. Fetching API...`);
                const response = await axios.get(`${process.env.WWM_LOCAL_API}/convert`, {
                    params: { id: finalId }
                });
                const responseBody = response.data;
                console.log(`[Face-Converter] API Response Status: ${response.status}`);

                // Handle wrapped response from local API
                if (responseBody && responseBody.origin) {
                    data = responseBody.origin;
                } else {
                    data = responseBody;
                }

                if (!data || !data.view_data) {
                    await interaction.deleteReply().catch(() => { });
                    return interaction.followUp({ content: `❌ Không tìm thấy thông tin cho mã: **${finalId}**`, ephemeral: true });
                }
                presetData = await FacePreset.create({ id: finalId, data: data });
            }

            // 3. Xử lý dữ liệu
            let viewData;
            try {
                viewData = typeof data.view_data === 'string' ? JSON.parse(data.view_data) : data.view_data;
            } catch (e) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({ content: "❌ Lỗi định dạng dữ liệu từ game.", ephemeral: true });
            }

            const faceData = viewData.face_data;
            if (!faceData) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({ content: "❌ Mã này không chứa dữ liệu khuôn mặt.", ephemeral: true });
            }

            const formatNumber = (num) => {
                if (!num) return '0';
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                return num.toString();
            };

            // 4. Tạo Embeds
            const embedInfo = new EmbedBuilder()
                .setTitle(data.name || 'Unknown')
                .setDescription(`*${data.msg || 'Không có mô tả'}*`)
                .addFields(
                    { name: '🔥 Độ hot', value: formatNumber(data.heat_val), inline: true },
                    { name: '✨ Yêu thích', value: formatNumber(data.like_num), inline: true },
                    { name: '👤 Host ID', value: `${data.hostnum || 'N/A'}`, inline: true }
                )
                .setColor("#1a1a1a")
                .setTimestamp()
                .setFooter({ text: `Plan ID: ${data.plan_id || finalId}`, iconURL: interaction.client.user.displayAvatarURL() });

            if (data.picture_url) embedInfo.setImage(data.picture_url);
            // Gộp face_data thuần + skeleton/makeup JSON vào 1 chuỗi (format game import)
            const extraData = {};
            if (viewData.face_skeleton_data) extraData.face_skeleton_data = viewData.face_skeleton_data;
            if (viewData.face_makeup_data) extraData.face_makeup_data = viewData.face_makeup_data;

            const extraStr = Object.keys(extraData).length > 0 ? " " + JSON.stringify(extraData) : "";
            const fullPresetStr = faceData + extraStr;

            const embedCode = new EmbedBuilder()
                .setColor("#1a1a1a")
                .setTitle("📋 Preset Data")
                .setDescription(`\`\`\`${fullPresetStr.length > 4000 ? fullPresetStr.substring(0, 4000) + "..." : fullPresetStr}\`\`\``);

            await interaction.editReply({ embeds: [embedInfo, embedCode] });

            // 5. Auto-Archive Forum
            try {
                const config = await GuildConfig.findOne({ guildId: interaction.guildId }).lean();
                if (config && config.faceForumId) {
                    const fresh = await FacePreset.findOne({ id: finalId }).lean();
                    if (!fresh.postedChannels.includes(config.faceForumId)) {
                        const forum = await interaction.client.channels.fetch(config.faceForumId).catch(() => null);
                        if (forum && forum.type === 15) {
                            await forum.threads.create({
                                name: (data.name || 'Preset').substring(0, 100),
                                message: { embeds: [embedInfo, embedCode] }
                            });
                            await FacePreset.updateOne({ _id: fresh._id }, { $addToSet: { postedChannels: config.faceForumId } });
                            console.log(`[Auto-Archive] Thành công: ${data.name}`);
                        }
                    }
                }
            } catch (err) { }

        } catch (error) {
            console.error("[Face-Converter Error]:", error);
            await interaction.deleteReply().catch(() => { });
            await interaction.followUp({ content: "❌ Đã xảy ra lỗi hệ thống khi xử lý. Thử lại sau nhé.", ephemeral: true }).catch(() => null);
        }
    },
};