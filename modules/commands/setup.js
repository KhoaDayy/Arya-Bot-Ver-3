const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { GuildConfig } = require("../../db/schemas");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Cấu hình bot cho server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName("face-forum")
                .setDescription("Thiết lập kênh Forum để lưu trữ các preset khuôn mặt")
                .addChannelOption(option =>
                    option.setName("channel")
                        .setDescription("Chọn kênh Forum")
                        .addChannelTypes(ChannelType.GuildForum)
                        .setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "face-forum") {
            const channel = interaction.options.getChannel("channel");

            try {
                // Upsert config
                await GuildConfig.findOneAndUpdate(
                    { guildId: interaction.guildId },
                    { faceForumId: channel.id },
                    { upsert: true, new: true }
                );

                await interaction.reply({
                    content: `✅ Đã thiết lập kênh lưu trữ preset: ${channel}`,
                    ephemeral: true
                });
            } catch (error) {
                console.error("Setup error:", error);
                await interaction.reply({
                    content: "❌ Có lỗi xảy ra khi lưu cấu hình.",
                    ephemeral: true
                });
            }
        }
    },
};
