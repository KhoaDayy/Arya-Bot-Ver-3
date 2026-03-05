const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const {
    decodeQR,
    parsePresetId,
    fetchPresetData,
    parseFaceData,
    buildPresetEmbeds,
    autoArchiveForum,
} = require('../../services/facePresetService');

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
                return interaction.followUp({ content: "❌ Bạn cần cung cấp mã preset hoặc tải lên ảnh QR Code.", flags: MessageFlags.Ephemeral });
            }

            // 1. Giải mã QR Code
            if (imageAttachment) {
                const decodedData = await decodeQR(imageAttachment.url);

                if (decodedData) {
                    finalId = decodedData;
                    console.log(`[Face-Converter] QR Decoded ID: ${decodedData}`);
                } else if (!inputCode) {
                    await interaction.deleteReply().catch(() => { });
                    return interaction.followUp({
                        content: `❌ Bot không thể nhận diện mã QR trong ảnh này.\n💡 **Mẹo:** Hãy đảm bảo ảnh rõ nét và không bị cắt mất phần góc mã QR.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            if (!finalId) finalId = inputCode;
            if (!finalId) return;

            finalId = parsePresetId(finalId);
            console.log(`[Face-Converter] Final Target ID: ${finalId}`);

            // 2. Fetch preset data (cache hoặc API)
            const result = await fetchPresetData(finalId);
            if (!result) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({ content: `❌ Không tìm thấy thông tin cho mã: **${finalId}**`, flags: MessageFlags.Ephemeral });
            }

            const { data, presetData } = result;

            // 3. Parse face data
            const parsed = parseFaceData(data);
            if (!parsed) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({ content: "❌ Mã này không chứa dữ liệu khuôn mặt hoặc bị lỗi định dạng.", flags: MessageFlags.Ephemeral });
            }

            const { viewData, faceData } = parsed;

            // 4. Build và gửi Embeds
            const embeds = buildPresetEmbeds(data, viewData, faceData, finalId, interaction.client, { includeExtraData: true });
            await interaction.editReply({ embeds });

            // 5. Auto-Archive Forum
            await autoArchiveForum(interaction.guildId, finalId, presetData, embeds, interaction.client);

        } catch (error) {
            console.error("[Face-Converter Error]:", error);
            await interaction.deleteReply().catch(() => { });
            await interaction.followUp({ content: "❌ Đã xảy ra lỗi hệ thống khi xử lý. Thử lại sau nhé.", flags: MessageFlags.Ephemeral }).catch(() => null);
        }
    },
};