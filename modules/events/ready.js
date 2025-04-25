// modules/events/ready.js
const { ActivityType } = require("discord.js");
const { loadConfig } = require("../../utils/statsConfig");

const activities = [
  "把回忆拼好给你",
  "Jumping Machine (跳楼机)",
  "器张",
  "哪里都是你",
  "追光者",
  "怎麼了",
  "回到夏天",
  "就忘了吧",
];

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    let i = 0;
    setInterval(() => {
      client.user.setPresence({
        status: "idle",
        activities: [
          {
            name: `🎶${activities[i]}`,
            type: ActivityType.Listening,
          },
        ],
      });
      i = (i + 1) % activities.length;
    }, 200 * 1000); 

    const config = loadConfig();
    const guildIds = Object.keys(config);
    if (guildIds.length === 0) return;

    async function updateGuildStats(guildId, channels) {
      try {
        const guild = await client.guilds.fetch(guildId);
        await guild.members.fetch();
        await guild.channels.fetch();

        const totalCount = guild.memberCount;
        const botCount = guild.members.cache.filter((m) => m.user.bot).size;
        const userCount = totalCount - botCount;

        if (channels.total) {
          const ch = guild.channels.cache.get(channels.total);
          if (ch) await ch.setName(`👥・Tổng: ${totalCount}`);
        }
        if (channels.members) {
          const ch = guild.channels.cache.get(channels.members);
          if (ch) await ch.setName(`👤・Members: ${userCount}`);
        }
        if (channels.bots) {
          const ch = guild.channels.cache.get(channels.bots);
          if (ch) await ch.setName(`🤖・Bots: ${botCount}`);
        }
      } catch {}
    }

    for (const gid of guildIds) {
      await updateGuildStats(gid, config[gid]);
    }

    setInterval(() => {
      for (const gid of guildIds) {
        updateGuildStats(gid, config[gid]);
      }
    }, 5 * 60 * 1000);
  },
};
