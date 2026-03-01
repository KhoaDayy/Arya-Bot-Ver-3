const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    MessageFlags,
} = require("discord.js");
const {
    decodeQR,
    parsePresetId,
    fetchPresetData,
    parseFaceData,
    buildPresetEmbeds,
    autoArchiveForum,
} = require('../../services/facePresetService');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Convert Face Preset")
        .setType(ApplicationCommandType.Message),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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

            // 2. Giải mã QR Code
            const faceCode = await decodeQR(imageUrl);
            if (!faceCode) {
                return interaction.editReply({ content: "❌ Không tìm thấy mã QR hợp lệ trong ảnh này." });
            }

            const finalId = parsePresetId(faceCode);

            // 3. Fetch preset data (cache hoặc API)
            const result = await fetchPresetData(finalId);
            if (!result) {
                return interaction.editReply({ content: `❌ Không tìm thấy thông tin cho mã: **${finalId}**` });
            }

            const { data, presetData } = result;

            // 4. Parse face data
            const parsed = parseFaceData(data);
            if (!parsed) {
                return interaction.editReply({ content: "❌ Mã này không chứa dữ liệu khuôn mặt hoặc bị lỗi định dạng." });
            }

            const { viewData, faceData } = parsed;

            // 5. Build và gửi Embeds
            const embeds = buildPresetEmbeds(data, viewData, faceData, finalId, interaction.client);
            await interaction.editReply({ embeds });

            // 6. Auto-Archive Forum
            await autoArchiveForum(interaction.guildId, finalId, presetData, embeds, interaction.client);

        } catch (error) {
            console.error("[Context-Face-Error]:", error);
            await interaction.editReply({ content: "❌ Có lỗi xảy ra khi xử lý khuôn mặt. Hãy thử lại sau." }).catch(() => null);
        }
    },
};