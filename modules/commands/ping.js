const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Kiểm tra độ trễ và trạng thái bot"),
    async execute(interaction) {
        const sent = await interaction.reply({ content: "🏓 Đang đo...", fetchReply: true });

        const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = interaction.client.ws.ping;
        const uptime = process.uptime();

        // Format uptime
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const uptimeStr = [
            days > 0 ? `${days}d` : '',
            hours > 0 ? `${hours}h` : '',
            `${mins}m`
        ].filter(Boolean).join(' ');

        const embed = new EmbedBuilder()
            .setColor(wsLatency < 100 ? '#57F287' : wsLatency < 300 ? '#FEE75C' : '#ED4245')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 API Latency', value: `\`${roundTrip}ms\``, inline: true },
                { name: '💓 WebSocket', value: `\`${wsLatency}ms\``, inline: true },
                { name: '⏱️ Uptime', value: `\`${uptimeStr}\``, inline: true },
            )
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [embed] });
    },
    category: "⚙️ Tiện ích (Utility)",
};