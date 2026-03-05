const { SlashCommandBuilder, EmbedBuilder, bold, italic, inlineCode, codeBlock } = require("discord.js");
const axios = require("axios");
const { formatNumber, getBodyType } = require('../../utils/formatters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("face-lookup")
        .setDescription("Tra cứu dữ liệu khuôn mặt (Face Codes/Plans) của người chơi WWM")
        .addStringOption(option =>
            option.setName("keyword")
                .setDescription("Nhập Tên hoặc ID người chơi")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("server")
                .setDescription("Máy chủ (SEA hoặc CN)")
                .addChoices(
                    { name: 'SEA', value: 'SEA' },
                    { name: 'CN', value: 'CN' }
                )
                .setRequired(false))
        .addStringOption(option =>
            option.setName("slot")
                .setDescription("Chọn Slot (1, 2, 3) hoặc Tất cả (all)")
                .addChoices(
                    { name: 'Slot 1', value: '1' },
                    { name: 'Slot 2', value: '2' },
                    { name: 'Slot 3', value: '3' },
                    { name: 'Tất cả (All)', value: 'all' }
                )
                .setRequired(false)),
    category: "🎮 Game (WWM)",

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const keyword = interaction.options.getString("keyword").trim();
            const serverParam = interaction.options.getString("server");
            const slotParam = interaction.options.getString("slot");

            // URL Endpoint
            const apiUrl = process.env.WWM_LOCAL_API || "https://api.hasukatsu.site";

            // Chuẩn bị biến request
            const params = {};
            const isId = /^\d+$/.test(keyword);
            if (isId) {
                params.id = keyword;
            } else {
                params.name = keyword;
            }
            if (serverParam) params.server = serverParam;
            if (slotParam) params.slot = slotParam;

            let response;
            try {
                response = await axios.get(`${apiUrl}/face_lookup`, {
                    params: params,
                    timeout: 20000 // 20s
                });
            } catch (err) {
                console.log(err.message);
                if (err.response && err.response.status === 404) {
                    await interaction.deleteReply().catch(() => { });
                    return interaction.followUp({ content: `❌ Không tìm thấy thông tin khuôn mặt cho người chơi: **${keyword}**`, ephemeral: true });
                }
                throw err;
            }

            const data = response.data;

            if (!data || data.success === false) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({
                    content: `❌ ${data?.msg || data?.error || ("Không tìm thấy người chơi: **" + keyword + "**")}`,
                    ephemeral: true
                });
            }

            // Lấy danh sách khuôn mặt
            let faces = [];
            if (data.is_all && data.faces) {
                faces = data.faces;
            } else if (data.plan_id) {
                faces = [data]; // Trả về 1 mặt trực tiếp
            }

            if (faces.length === 0) {
                await interaction.deleteReply().catch(() => { });
                return interaction.followUp({
                    content: `❌ Người chơi **${data.player_name || keyword}** chưa thiết lập khuôn mặt hoặc slot đang trống.`,
                    ephemeral: true
                });
            }




            // Discord giới hạn TỔNG SỐ KÝ TỰ trong TẤT CẢ embeds của 1 tin nhắn là 6000.
            // Mỗi face_code dài khoảng >4000 kí tự. Vậy nên nếu người dùng search "all" có 2-3 khuôn mặt 
            // thì tổng ký tự có thể lến đến 12,000 > 6000 -> Làm crash bot.
            // GIẢI PHÁP: Gửi tách rời từng Preset thành từng tin nhắn riêng biệt.

            let isFirstFace = true;

            for (let i = 0; i < faces.length; i++) {
                const face = faces[i];
                const currentEmbeds = [];

                const embedInfo = new EmbedBuilder()
                    .setTitle(face.name || 'Unknown')
                    .setDescription(italic(`Sở hữu bởi: ${bold(data.player_name || keyword)}\nServer: ${inlineCode(data.server || serverParam || 'Unknown')}`))
                    .addFields(
                        { name: "🔥 Độ hot", value: formatNumber(face.heat_val), inline: true },
                        { name: "✨ Yêu thích", value: formatNumber(face.like_num), inline: true },
                        { name: "👤 Giới tính", value: `${getBodyType(face.body_type)}`, inline: true }
                    )
                    .setColor("#1a1a1a")
                    .setTimestamp()
                    .setFooter({ text: `Plan ID: ${face.plan_id || 'N/A'} ${faces.length > 1 ? `(Slot ${i + 1}/${faces.length})` : ''}`, iconURL: interaction.client.user.displayAvatarURL() });

                if (face.picture_url) {
                    const match = face.picture_url.match(/https?:\/\/[^\s]+/);
                    if (match) {
                        embedInfo.setImage(match[0]);
                    }
                }
                currentEmbeds.push(embedInfo);

                if (face.face_code) {
                    const faceCodeText = face.face_code.length > 4000
                        ? face.face_code.substring(0, 4000) + "..."
                        : face.face_code;

                    const embedCode = new EmbedBuilder()
                        .setColor("#1a1a1a")
                        .setTitle("📋 Preset Data")
                        .setDescription(codeBlock(faceCodeText));
                    currentEmbeds.push(embedCode);
                }

                if (isFirstFace) {
                    await interaction.editReply({ embeds: currentEmbeds });
                    isFirstFace = false;
                } else {
                    await interaction.followUp({ embeds: currentEmbeds });
                }
            }

        } catch (error) {
            console.error("[Face-Lookup Error]:", error);
            const errMsg = "❌ Đã xảy ra lỗi hệ thống khi tra cứu dữ liệu mặt. Vui lòng thử lại sau.";
            await interaction.deleteReply().catch(() => { });
            await interaction.followUp({ content: errMsg, ephemeral: true }).catch(() => null);
        }
    },
};
