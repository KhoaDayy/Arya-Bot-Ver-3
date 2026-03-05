const {
  SlashCommandBuilder,
  MessageFlags,
  // Components v2
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize
} = require("discord.js");

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
  cooldown: 3,
  category: "📝 Thông tin (Info)",

  // Xử lý autocomplete cho option 'command'
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const isOwner = interaction.user.id === process.env.OWNER_ID;

    const commands = Array.from(interaction.client.commands.values())
      .filter(cmd => {
        if (cmd.devOnly && !isOwner) return false;
        return cmd.data.name.startsWith(focused);
      })
      .slice(0, 25);

    await interaction.respond(
      commands.map(cmd => ({ name: `/${cmd.data.name}`, value: cmd.data.name }))
    );
  },

  async execute(interaction) {
    const name = interaction.options.getString("command");
    const cmds = interaction.client.commands;
    const isOwner = interaction.user.id === process.env.OWNER_ID;

    // Chi tiết 1 lệnh nếu có tên
    if (name) {
      const cmd = cmds.get(name);
      if (!cmd || (cmd.devOnly && !isOwner)) {
        return interaction.reply({
          content: `❌ Không tìm thấy lệnh \`${name}\`.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const { data } = cmd;
      const container = new ContainerBuilder();

      let content = `## ℹ️ Chi tiết lệnh /${data.name}\n${data.description || "Không có mô tả."}\n`;

      // Subcommands
      const subcommands = data.options?.filter(o => o.type === 1);
      if (subcommands?.length) {
        content += `\n### 📂 Subcommands\n`;
        const subs = subcommands.map(o => `\u2022 \`/${data.name} ${o.name}\` — ${o.description}`);
        content += subs.join("\n") + `\n`;
      }

      // Options
      const options = [];
      for (const o of data.options || []) {
        if (o.type === 1) {
          for (const so of o.options || []) {
            options.push(
              `\u2022 \`/${data.name} ${o.name} ${so.name}\` — ${so.description} (${so.required ? "bắt buộc" : "tùy chọn"})`
            );
          }
        } else {
          options.push(
            `\u2022 \`/${data.name} ${o.name}\` — ${o.description} (${o.required ? "bắt buộc" : "tùy chọn"})`
          );
        }
      }
      if (options.length) {
        content += `\n### 🔧 Options\n${options.join("\n")}`;
      }

      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));

      return interaction.reply({ components: [container], flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2 });
    }

    // List tổng quát khi không có tên lệnh
    const sections = {};
    for (const cmd of cmds.values()) {
      if (cmd.devOnly && !isOwner) continue; // Lọc lệnh owner-only

      const category = cmd.category || "❓Khác";
      if (!sections[category]) sections[category] = [];
      sections[category].push(`\u2022 \`/${cmd.data.name}\` — ${cmd.data.description}`);
    }

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 📜 Danh sách lệnh\nCác lệnh được phân theo nhóm bên dưới. Dùng \`/help [lệnh]\` để xem chi tiết.`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

    // Thêm các category
    const entries = Object.entries(sections);
    for (let i = 0; i < entries.length; i++) {
      const [group, list] = entries[i];
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### ${group}\n${list.join("\n")}`)
      );
      if (i < entries.length - 1) {
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      }
    }

    await interaction.reply({ components: [container], flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2 });
  }
};
