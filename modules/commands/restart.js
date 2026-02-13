const { SlashCommandBuilder } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Cập nhật code từ Git và khởi động lại bot."),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: "❌ Bạn không có quyền sử dụng lệnh này!",
                ephemeral: true,
            });
        }

        try {
            await interaction.reply("⏳ Đang tiến hành Git Pull để lấy code mới nhất...");

            // Thực hiện Git Pull
            exec("git pull", async (error, stdout, stderr) => {
                let pullMessage = "";
                if (error) {
                    console.error(`Git Pull Error: ${error.message}`);
                    pullMessage = `⚠️ Git Pull thất bại: \`${error.message}\`\nBot vẫn sẽ khởi động lại...`;
                } else {
                    console.log(`Git Pull Output: ${stdout}`);
                    pullMessage = `✅ Git Pull thành công!\n\`\`\`${stdout.slice(0, 500)}\`\`\``;
                }

                await interaction.followUp(`${pullMessage}\n🔄 Đang khởi động lại bot...`);

                console.log(`[RESTART] Bot được khởi động lại bởi ${interaction.user.tag}`);

                // Thoát process sau khi đã thông báo
                setTimeout(() => {
                    process.exit(0);
                }, 2000);
            });

        } catch (error) {
            console.error("Lỗi khi khởi động lại:", error);
            await interaction.followUp({
                content: "❌ Có lỗi xảy ra trong quá trình cập nhật và khởi động lại.",
                ephemeral: true,
            });
        }
    },
    category: "⚙️ Hệ thống (System)",
};
