const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const axios = require('axios');
const { requireOwner } = require('../../utils/guards');

const VALID_BOT_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbot')
        .setDescription('Thay đổi avatar hoặc banner của bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Chọn loại ảnh muốn thay')
                .setRequired(true)
                .addChoices(
                    { name: 'Avatar', value: 'avatar' },
                    { name: 'Banner', value: 'banner' },
                )
        )
        .addAttachmentOption(option =>
            option
                .setName('image')
                .setDescription('Tải lên tệp ảnh (PNG/JPEG/GIF/WEBP)')
                .setRequired(true)
        ),
    category: '🔧 Quản trị (Admin)',
    devOnly: true,

    async execute(interaction) {
        // Dùng guard tập trung
        if (await requireOwner(interaction)) return;

        const attachment = interaction.options.getAttachment('image');

        // Kiểm tra định dạng ảnh (Set.has O(1) thay vì startsWith để chính xác hơn)
        if (!attachment || !VALID_BOT_IMAGE_TYPES.has(attachment.contentType?.split(';')[0])) {
            return interaction.reply({
                content: '❌ Vui lòng đính kèm tệp ảnh hợp lệ (PNG, JPEG, GIF hoặc WEBP).',
                flags: MessageFlags.Ephemeral,
            });
        }

        const type = interaction.options.getString('type');
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const response = await axios.get(attachment.url, {
                responseType: 'arraybuffer',
                timeout: 10_000,
            });
            const buffer = Buffer.from(response.data);

            if (type === 'avatar') {
                await interaction.client.user.setAvatar(buffer);
                await interaction.editReply('✅ Đã cập nhật **avatar** của bot thành công!');
            } else {
                await interaction.client.user.setBanner(buffer);
                await interaction.editReply('✅ Đã cập nhật **banner** của bot thành công!');
            }
        } catch (error) {
            console.error(`[setbot] Error setting ${type}:`, error.message);
            await interaction.editReply(`❌ Có lỗi khi cập nhật ${type}. Hãy thử lại sau.`);
        }
    }
};