const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("player-lookup")
        .setDescription("Tra cứu profile người chơi WWM")
        .addStringOption(option =>
            option.setName("keyword")
                .setDescription("Tên nhân vật hoặc ID")
                .setRequired(true)),
    category: "🎮 Game (WWM)",
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const keyword = interaction.options.getString("keyword").trim();
            const response = await axios.get(`http://localhost:3001/lookup`, {
                params: { keyword: keyword }
            });

            const data = response.data;
            if (!data || !data.nickname) {
                return interaction.editReply({ content: `❌ Không tìm thấy người chơi: **${keyword}**` });
            }

            // Tính toán dữ liệu
            const buildPower = data.max_xiuwei_kungfu ? new Intl.NumberFormat().format(data.max_xiuwei_kungfu) : "0";
            const onlineHours = data.online_time ? Math.floor(data.online_time / 3600) : 0;
            const createdDate = data.create_time ? moment.unix(data.create_time).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "N/A";

            const embed = new EmbedBuilder()
                .setTitle(data.nickname)
                .setColor("#2b2d31")
                .addFields(
                    { name: "Level", value: `${data.level || "0"}`, inline: true },
                    { name: "UID", value: `${data.number_id || "N/A"}`, inline: true },
                    { name: "Server", value: `${data.oversea_tag || "SEA"}`, inline: true },
                    { name: "Build Power", value: `${buildPower}`, inline: true },
                    { name: "Sect", value: `${data.school_name || "Vô môn"}`, inline: true },
                    { name: "Online Time", value: `${onlineHours}h`, inline: true },
                    { name: "Account Created", value: `Ngày ${createdDate}`, inline: false }
                );

            if (data.sign) {
                embed.setDescription(`*${data.sign}*`);
            }

            if (data.shot_img) {
                embed.setImage(data.shot_img);
            }

            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("[Player-Lookup Error]:", error);
            await interaction.editReply({ content: "❌ Không tìm thấy người chơi." }).catch(() => null);
        }
    },
};
