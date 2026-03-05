const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { execFile } = require("child_process"); // execFile an toàn hơn exec, không chạy qua shell
const { requireOwner } = require("../../utils/guards");
const { sysLog } = require("../../utils/consoleLogger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Cập nhật code từ Git và khởi động lại bot.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    devOnly: true,
    category: "⚙️ Hệ thống (System)",

    async execute(interaction) {
        // Dùng guard tập trung thay vì check thủ công
        if (await requireOwner(interaction)) return;

        await interaction.reply({
            content: "⏳ Đang tiến hành **Git Pull** để lấy code mới nhất...",
            flags: MessageFlags.Ephemeral,
        });

        // execFile('git', ['pull']) — an toàn hơn exec("git pull") vì không chạy qua shell
        // → không bị shell injection (dù ở đây không có user input, vẫn là best practice)
        execFile("git", ["pull"], async (error, stdout) => {
            let pullMessage;
            if (error) {
                sysLog('RESTART', `Git Pull failed: ${error.message}`, require('chalk').hex?.('#FEE75C') ?? console);
                pullMessage = `⚠️ Git Pull thất bại:\n\`${error.message.slice(0, 300)}\`\nBot vẫn sẽ khởi động lại...`;
            } else {
                const output = stdout.trim().slice(0, 500);
                sysLog('RESTART', `Git Pull OK — restarting by ${interaction.user.username}`);
                pullMessage = `✅ Git Pull thành công!\n\`\`\`${output || 'Already up to date.'}\`\`\``;
            }

            await interaction.followUp({
                content: `${pullMessage}\n\n🔄 Đang khởi động lại bot...`,
                flags: MessageFlags.Ephemeral,
            }).catch(() => { });

            setTimeout(() => process.exit(0), 2000);
        });
    },
};
