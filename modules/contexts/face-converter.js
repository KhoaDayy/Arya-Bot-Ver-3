const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");
const axios = require("axios");
const { Jimp } = require("jimp");
const QrCodeReader = require("qrcode-reader");
const { FacePreset, GuildConfig } = require("../../db/schemas");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Convert Face Preset")
        .setType(ApplicationCommandType.Message),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const message = interaction.targetMessage;

            // 1. Tìm ảnh từ tin nhắn (attachment hoặc link URL)
            const attachment = message.attachments.find(a => a.contentType?.startsWith("image/"));
            let imageUrl = attachment ? attachment.url : null;

            if (!imageUrl) {
                const links = message.content.match(/https?:\/\/\S+/gi) || [];
                imageUrl = links.find(u => /\.(jpe?g|png|gif|webp)$/i.test(u));
            }

            if (!imageUrl) {
                return interaction.editReply({ content: "❌ Không tìm thấy ảnh nào trong tin nhắn này." });
            }

            // 2. Giải mã QR Code cục bộ
            let faceCode = null;
            try {
                const image = await Jimp.read(imageUrl);
                const qr = new QrCodeReader();

                faceCode = await new Promise((resolve) => {
                    qr.callback = (err, value) => {
                        if (err) return resolve(null);
                        resolve(value.result);
                    };
                    qr.decode(image.bitmap);
                });
            } catch (err) {
                console.error("[Context-QR-Error]:", err.message);
            }

            if (!faceCode) {
                return interaction.editReply({ content: "❌ Không tìm thấy mã QR hợp lệ trong ảnh này." });
            }

            // 3. Xử lý logic như face-converter.js
            if (faceCode.includes("id=")) {
                const parts = faceCode.split("id=");
                if (parts.length > 1) faceCode = parts[1].split("&")[0];
            }
            faceCode = faceCode.trim();

            // 4. Database Cache
            let presetData = await FacePreset.findOne({ id: faceCode });
            let data;

            if (presetData) {
                data = presetData.data;
            } else {
                const response = await axios.get(`https://wwm-api-server-v1.onrender.com/convert`, {
                    params: { id: faceCode }
                });
                data = response.data;

                if (!data || !data.view_data) {
                    return interaction.editReply({ content: `❌ Không tìm thấy thông tin cho mã: **${faceCode}**` });
                }
                presetData = await FacePreset.create({ id: faceCode, data: data });
            }

            // 5. Phân tích dữ liệu
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

            // 6. Tạo Embeds
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
                .setFooter({ text: `Plan ID: ${data.plan_id || faceCode}`, iconURL: interaction.client.user.displayAvatarURL() });

            if (data.picture_url) embedInfo.setImage(data.picture_url);

            const embedCode = new EmbedBuilder()
                .setColor("#1a1a1a")
                .setDescription(`\`\`\`${faceData.length > 4000 ? faceData.substring(0, 4000) + "..." : faceData}\`\`\``);

            await interaction.editReply({ embeds: [embedInfo, embedCode] });

            // 7. Auto-Archive Forum
            try {
                const config = await GuildConfig.findOne({ guildId: interaction.guildId });
                if (config && config.faceForumId) {
                    const fresh = await FacePreset.findOne({ id: faceCode });
                    if (!fresh.postedChannels.includes(config.faceForumId)) {
                        const forum = await interaction.client.channels.fetch(config.faceForumId).catch(() => null);
                        if (forum && forum.type === 15) {
                            await forum.threads.create({
                                name: (data.name || 'Preset').substring(0, 100),
                                message: { embeds: [embedInfo, embedCode] }
                            });
                            await FacePreset.updateOne({ _id: fresh._id }, { $addToSet: { postedChannels: config.faceForumId } });
                        }
                    }
                }
            } catch (err) {
                console.error("[Context-Archive-Error]:", err.message);
            }

        } catch (error) {
            console.error("[Context-Face-Error]:", error);
            await interaction.editReply({ content: "❌ Có lỗi xảy ra khi xử lý khuôn mặt. Hãy thử lại sau." }).catch(() => null);
        }
    },
};