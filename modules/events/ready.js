// modules/events/ready.js
const { ActivityType } = require("discord.js");
const { loadConfig } = require("../../utils/statsConfig");
const { sysLog } = require("../../utils/consoleLogger");

const activities = [
  "Anh cũng sẽ phải quên, không cần em ở bên...",
  "Anh phải làm gì để em đừng nghĩ em không quan trọng...",
  "Vì ngày em đẹp nhất, là ngày anh mất em...",
  "Em đã xa anh mất rồi người ơi...",
  "350 xé đôi, con tim anh sẽ nguôi...",
];

// Dùng tên 'clientReady' để phù hợp với Events.ClientReady trong index.js
module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    // ── Rotate Status ──────────────────────────────────────────────────────
    let i = 0;
    setInterval(() => {
      client.user.setPresence({
        status: "idle",
        activities: [{ name: `🎶${activities[i]}`, type: ActivityType.Listening }],
      });
      i = (i + 1) % activities.length;
    }, 200_000);

    // ── Stats Channels ─────────────────────────────────────────────────────
    const config = loadConfig();
    const guildEntries = Object.entries(config);
    if (guildEntries.length === 0) return;

    async function updateGuildStats(guildId, channels) {
      try {
        const guild = await client.guilds.fetch(guildId);
        await Promise.all([guild.members.fetch(), guild.channels.fetch()]);

        const totalCount = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const userCount = totalCount - botCount;

        const updates = [];
        if (channels.total) {
          const ch = guild.channels.cache.get(channels.total);
          if (ch) updates.push(ch.setName(`👥・Tổng: ${totalCount}`));
        }
        if (channels.members) {
          const ch = guild.channels.cache.get(channels.members);
          if (ch) updates.push(ch.setName(`👤・Members: ${userCount}`));
        }
        if (channels.bots) {
          const ch = guild.channels.cache.get(channels.bots);
          if (ch) updates.push(ch.setName(`🤖・Bots: ${botCount}`));
        }
        if (updates.length > 0) await Promise.all(updates);
      } catch { /* Guild không còn trong cache, bỏ qua */ }
    }

    // Chạy lần đầu khi bot ready
    Promise.allSettled(guildEntries.map(([gid, cfg]) => updateGuildStats(gid, cfg)))
      .then(() => sysLog('STATS', `Updated stats channels for ${guildEntries.length} guild(s)`));

    // Lặp định kỳ mỗi 5 phút
    setInterval(() => {
      Promise.allSettled(guildEntries.map(([gid, cfg]) => updateGuildStats(gid, cfg)));
    }, 5 * 60_000);
  },
};
