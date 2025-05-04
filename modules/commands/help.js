const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Liệt kê lệnh hoặc xem chi tiết lệnh")
    .addStringOption(opt =>
      opt
        .setName("command")
        .setDescription("Tên lệnh muốn xem chi tiết")
        .setRequired(false)
        .setAutocomplete(true)
    ),
    category: "📝 Thông tin (Info)",

  // Xử lý autocomplete cho option 'command'
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const commands = Array.from(interaction.client.commands.keys());
    const filtered = commands
      .filter(cmd => cmd.startsWith(focused))
      .slice(0, 25);

    await interaction.respond(
      filtered.map(cmd => ({ name: `/${cmd}`, value: cmd }))
    );
  },

  async execute(interaction) {
    const name = interaction.options.getString("command");
    const cmds = interaction.client.commands;

    // Chi tiết 1 lệnh nếu có tên
    if (name) {
      const cmd = cmds.get(name);
      if (!cmd) {
        return interaction.reply({
          content: `❌ Không tìm thấy lệnh \`${name}\`.`,
          ephemeral: true
        });
      }

      const { data } = cmd;
      const embed = new EmbedBuilder()
        .setTitle(`ℹ️ Chi tiết lệnh /${data.name}`)
        .setDescription(data.description || "Không có mô tả.")
        .setColor(0x1ABC9C);

      // Subcommands
      const subcommands = data.options?.filter(o => o.type === 1);
      if (subcommands?.length) {
        const subs = subcommands.map(o => `\`/${data.name} ${o.name}\` — ${o.description}`);
        embed.addFields({ name: "📂 Subcommands", value: subs.join("\n"), inline: false });
      }

      // Options (global và của subcommands)
      const options = [];
      for (const o of data.options || []) {
        if (o.type === 1) {
          for (const so of o.options || []) {
            options.push(
              `\`/${data.name} ${o.name} ${so.name}\` — ${so.description} (${so.required ? "bắt buộc" : "tùy chọn"})`
            );
          }
        } else {
          options.push(
            `\`/${data.name} ${o.name}\` — ${o.description} (${o.required ? "bắt buộc" : "tùy chọn"})`
          );
        }
      }
      if (options.length) {
        embed.addFields({ name: "🔧 Options", value: options.join("\n"), inline: false });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // List tổng quát khi không có tên lệnh
    const sections = {};
    for (const cmd of cmds.values()) {
      const category = cmd.category || "❓Khác";
      if (!sections[category]) sections[category] = [];
      sections[category].push(`\`/${cmd.data.name}\` — ${cmd.data.description}`);
    }

    const helpEmbed = new EmbedBuilder()
      .setTitle("📜 Danh sách lệnh")
      .setDescription("Các lệnh được phân theo nhóm bên dưới. Dùng `/help [lệnh]` để xem chi tiết.")
      .setColor(0x1ABC9C)
      .setThumbnail(interaction.client.user.displayAvatarURL({ size: 128 }))
      .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ size: 128 }) })
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    // Thêm các category inline
    for (const [group, list] of Object.entries(sections)) {
      helpEmbed.addFields({ name: group, value: list.join("\n"), inline: true });
    }

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
};