const {
    SlashCommandBuilder,
    MessageFlags,
    // Components V2
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    LabelBuilder,
} = require('discord.js');
const { GuildWarConfig, GuildWarRegistration, GuildWarMember } = require('../../db/schemas');

// Emoji helpers (dùng chung với guildWarService)
const EM = {
    saturday: `<:saturday:1477352228305244390>`,
    sunday: `<:sunday:1477352226904346812>`,
    useraccount: `<:useraccount:1477352820666536016>`,
};

const ROLE_OPTIONS = [
    { label: 'DPS - Quạt dù công', emoji: '🪭' },
    { label: 'DPS - Vô danh', emoji: '🗡️' },
    { label: 'DPS - Song đao', emoji: '⚔️' },
    { label: 'DPS - Cửu kiếm', emoji: '🤺' },
    { label: 'Flex / 3 chỉ', emoji: '💫' },
    { label: 'Tank', emoji: '🛡️' },
    { label: 'Healer', emoji: '💚' },
];

function getRoleEmoji(roleStr) {
    if (!roleStr) return '❓';
    const s = roleStr.toLowerCase();
    if (s.includes('healer') || s.includes('hồi máu') || s.includes('y sư')) return '💚';
    if (s.includes('tank') || s.includes('thủ')) return '🛡️';
    if (s.includes('flex') || s.includes('3 chỉ')) return '💫';
    if (s.includes('quạt')) return '🪭';
    if (s.includes('vô danh')) return '🗡️';
    if (s.includes('song đao')) return '⚔️';
    if (s.includes('cửu kiếm')) return '🤺';
    return '⚔️'; // Default to DPS
}

function getRoleColor(roleStr) {
    if (!roleStr) return 0x5865F2;
    const s = roleStr.toLowerCase();
    if (s.includes('healer') || s.includes('hồi máu') || s.includes('y sư')) return 0x2ECC71;
    if (s.includes('tank') || s.includes('thủ')) return 0x3498DB;
    if (s.includes('flex') || s.includes('3 chỉ')) return 0x9B59B6;
    return 0xE74C3C; // Default to DPS red
}

/**
 * Build Components V2 container cho hồ sơ cố định
 */
function buildRegistrationCard(user, memberInfo, config) {
    const hasRegistered = !!memberInfo?.ingameName;
    const accentColor = hasRegistered
        ? getRoleColor(memberInfo.role)
        : 0x5865F2;

    const container = new ContainerBuilder().setAccentColor(accentColor);

    // ── Header ─────────────────────────────────────────────────────────
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## ${EM.useraccount} Hồ Sơ Guild War`
        )
    );
    container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    if (hasRegistered) {
        // ── Đã đăng ký: Hiển thị thông tin hiện tại ────────────────────
        const roleEmoji = getRoleEmoji(memberInfo.role);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### ✅ Thông tin đã ghi nhận\n` +
                `**Tên Ingame:** \`${memberInfo.ingameName}\`\n` +
                `**Vai trò:** ${roleEmoji} \`${memberInfo.role || 'Chưa chọn'}\`\n` +
                `-# Thông tin này được lưu cố định, tự động áp dụng mỗi khi bạn báo danh hàng tuần.`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

        // ── Action Buttons ─────────────────────────────────────────────
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# Bấm nút bên dưới để cập nhật thông tin`)
        );
    } else {
        // ── Chưa đăng ký: Hướng dẫn ───────────────────────────────────
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `Bạn chưa đăng ký thông tin Guild War.\n` +
                `Bấm nút bên dưới để nhập **Tên Ingame** và **Vai trò** của bạn.\n` +
                `-# Chỉ cần đăng ký 1 lần, thông tin sẽ được dùng cho tất cả các tuần.`
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    }

    // ── Nút thao tác ───────────────────────────────────────────────────
    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`gwreg_edit`)
                .setLabel(hasRegistered ? '✏️ Sửa thông tin' : '📝 Đăng ký ngay')
                .setStyle(hasRegistered ? ButtonStyle.Secondary : ButtonStyle.Primary)
        )
    );

    // ── Footer ─────────────────────────────────────────────────────────
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `-# ${EM.saturday} War T7: \`${config.timeT7}\`　${EM.sunday} War CN: \`${config.timeCN}\``
        )
    );

    return container;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gw-register')
        .setDescription('Đăng ký thông tin tham gia Guild War (Tên Ingame & Vai Trò) — lưu cố định'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const config = await GuildWarConfig.findOne({ guildId });
        if (!config || !config.isActive) {
            return interaction.editReply("❌ Tính năng Guild War chưa được bật ở Server này.");
        }

        const memberInfo = await GuildWarMember.findOne({ guildId, userId });

        const container = buildRegistrationCard(interaction.user, memberInfo, config);

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },

    /**
     * Handle button interactions (gwreg_*)
     * Gọi từ interactionCreate.js
     */
    async handleButton(interaction) {
        const customId = interaction.customId;
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        // Check GW active
        const config = await GuildWarConfig.findOne({ guildId });
        if (!config || !config.isActive) {
            return interaction.reply({ content: "❌ Guild War chưa bật.", flags: MessageFlags.Ephemeral });
        }

        // ── Edit: Mở Modal nhập tên + chọn vai trò ─────────────────────
        if (customId === 'gwreg_edit' || customId.startsWith('gwreg_edit_')) {
            let existingMember = await GuildWarMember.findOne({ guildId, userId });

            // Text Input: Tên Ingame
            const ingameInput = new TextInputBuilder()
                .setCustomId('ingame_name')
                .setPlaceholder('VD: Hasukatsu, XiaoMing...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(50);
            if (existingMember?.ingameName) ingameInput.setValue(existingMember.ingameName);

            const ingameLabel = new LabelBuilder()
                .setLabel('Tên Ingame của bạn')
                .setTextInputComponent(ingameInput);

            // Select Menu: Vai trò / Hệ phái
            const roleSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('role_choice')
                .setPlaceholder('Chọn Hệ Phái / Vũ Khí của bạn...')
                .setRequired(true)
                .addOptions(
                    ROLE_OPTIONS.map(opt =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(opt.label)
                            .setValue(opt.label)
                            .setEmoji(opt.emoji)
                            .setDefault(existingMember?.role === opt.label)
                    )
                );

            const roleLabel = new LabelBuilder()
                .setLabel('Hệ Phái / Vũ Khí')
                .setStringSelectMenuComponent(roleSelectMenu);

            // Build Modal V2 với LabelBuilder
            const modal = new ModalBuilder()
                .setCustomId(`gwreg_modal`)
                .setTitle('📝 Đăng Ký Guild War')
                .addLabelComponents(ingameLabel, roleLabel);

            return interaction.showModal(modal);
        }
    },

    /**
     * Handle modal submit (gwreg_modal*)
     * Gọi từ interactionCreate.js
     */
    async handleModalSubmit(interaction) {
        await interaction.deferUpdate();

        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const ingame = interaction.fields.getTextInputValue('ingame_name').trim();
        let finalRole = '';
        try {
            const roleValues = interaction.fields.getStringSelectValues('role_choice');
            if (roleValues && roleValues.length > 0) finalRole = roleValues[0];
        } catch (err) {
            console.error("No select menu value found:", err);
        }

        const config = await GuildWarConfig.findOne({ guildId });
        if (!config) return;

        // Lưu thông tin cố định vào GuildWarMember
        let memberInfo = await GuildWarMember.findOne({ guildId, userId });
        if (!memberInfo) {
            memberInfo = new GuildWarMember({ guildId, userId, ingameName: ingame, role: finalRole });
        } else {
            memberInfo.ingameName = ingame;
            if (finalRole) memberInfo.role = finalRole;
        }
        await memberInfo.save();

        // Đồng thời cập nhật đăng ký tuần hiện tại nếu đã có (ai đã báo danh rồi thì sync lại)
        await GuildWarRegistration.updateMany(
            { guildId, userId },
            { $set: { ingameName: ingame, ...(finalRole ? { role: finalRole } : {}) } }
        );

        // Rebuild card
        const container = buildRegistrationCard(interaction.user, memberInfo, config);
        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
