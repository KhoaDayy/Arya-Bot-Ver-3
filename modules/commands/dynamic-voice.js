const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const { VoiceTemplate } = require("./../../db/schemas");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dynamic-voice")
    .setDescription("Tạo kênh voice động cho người dùng")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Khởi tạo hệ thống kênh voice động")
        .addChannelOption((opt) =>
          opt
            .setName("category")
            .setDescription("Chọn category chứa các kênh voice động")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("delete").setDescription("Xóa kênh mẫu và reset hệ thống")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === "create") {
      const category = interaction.options.getChannel("category");
      const template = await interaction.guild.channels.create({
        name: "➕ Join to create",
        type: ChannelType.GuildVoice,
        parent: category.id,
      });
      await VoiceTemplate.findOneAndUpdate(
        { guildId },
        { templateId: template.id },
        { upsert: true }
      );
      return interaction.reply({
        content: `✅ Đã tạo kênh mẫu: ${template} (ID: ${template.id})`,
        ephemeral: true,
      });
    }

    if (sub === "delete") {
      const record = await VoiceTemplate.findOne({ guildId });
      if (!record) {
        return interaction.reply({
          content: "⚠️ Chưa có kênh mẫu để xóa!",
          ephemeral: true,
        });
      }
      const chan = await interaction.guild.channels
        .fetch(record.templateId)
        .catch(() => null);
      if (chan) await chan.delete().catch(console.error);
      await VoiceTemplate.deleteOne({ guildId });
      return interaction.reply({
        content: "🗑️ Đã xóa kênh mẫu và reset hệ thống dynamic voice.",
        ephemeral: true,
      });
    }
  },
};
