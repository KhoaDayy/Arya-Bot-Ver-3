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
    async execute(interaction) {
        await interaction.deferReply();

        try {
            let inputCode = interaction.options.getString("code");
            const imageAttachment = interaction.options.getAttachment("qr");
            let finalId = null;

            if (!inputCode && !imageAttachment) {
                return interaction.editReply({ content: "❌ Bạn cần cung cấp mã preset hoặc tải lên ảnh QR Code." });
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
                    } else if (!inputCode) {
                        return interaction.editReply({
                            content: `❌ Bot không thể nhận diện mã QR trong ảnh này.\n💡 **Mẹo:** Hãy đảm bảo ảnh rõ nét và không bị cắt mất phần góc mã QR.`
                        });
                    }
                } catch (qrErr) {
                    if (!inputCode) return interaction.editReply({ content: "❌ Đã xảy ra lỗi khi xử lý ảnh QR." });
                }
            }

            if (!finalId) finalId = inputCode;
            if (!finalId) return;

            if (finalId.includes("id=")) {
                const parts = finalId.split("id=");
                if (parts.length > 1) finalId = parts[1].split("&")[0];
            }
            finalId = finalId.trim();

            // 2. Database Cache
            let presetData = await FacePreset.findOne({ id: finalId });
            let data;

            if (presetData) {
                data = presetData.data;
            } else {
                const response = await axios.get(`https://wwm-api-server-v1.onrender.com/convert`, {
                    params: { id: finalId }
                });
                data = response.data;

                if (!data || !data.view_data) {
                    return interaction.editReply({ content: `❌ Không tìm thấy thông tin cho mã: **${finalId}**` });
                }
                presetData = await FacePreset.create({ id: finalId, data: data });
            }

            // 3. Xử lý dữ liệu
            let viewData;
            try {
                viewData = typeof data.view_data === 'string' ? JSON.parse(data.view_data) : data.view_data;
            } catch (e) {
                return interaction.editReply({ content: "❌ Lỗi định dạng dữ liệu từ game." });
            }

            const faceData = viewData.face_data;
            if (!faceData) return interaction.editReply({ content: "❌ Mã này không chứa dữ liệu khuôn mặt." });

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

            const embedCode = new EmbedBuilder()
                .setColor("#1a1a1a")
                .setDescription(`\`\`\`${faceData.length > 4000 ? faceData.substring(0, 4000) + "..." : faceData}\`\`\``);

            await interaction.editReply({ embeds: [embedInfo, embedCode] });

            // 5. Auto-Archive Forum
            try {
                const config = await GuildConfig.findOne({ guildId: interaction.guildId });
                if (config && config.faceForumId) {
                    const fresh = await FacePreset.findOne({ id: finalId });
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
            await interaction.editReply({ content: "❌ Đã xảy ra lỗi hệ thống khi xử lý. Thử lại sau nhé." }).catch(() => null);
        }
    },
};