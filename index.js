require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const deployCommands = require("./utils/deployCommands");
const { fancyLog, initSpamControl, sysLog, printBanner, printLoadTable, printDeploy } = require("./utils/consoleLogger");
const { connectDB } = require("./db/connect");
const { GuildWarService } = require("./services/guildWar");
const { ClubActivityService, ClubActivityScheduler } = require("./services/clubActivity");
const { startDashboardApi } = require("./api/server");

const MODE = process.env.MODE || 'dev';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();
client.contexts = new Collection();
const events = [];

function load(dir, collection) {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) return [];
  const names = [];
  for (const file of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, file);
    if (fs.statSync(full).isFile() && file.endsWith(".js")) {
      const mod = require(full);
      if (mod.data && mod.execute) {
        collection.set(mod.data.name, mod);
        names.push(mod.data.name);
      }
    }
  }
  return names;
}

const cmdNames = load("modules/commands", client.commands);
const ctxNames = load("modules/contexts", client.contexts);

const evDir = path.join(__dirname, "modules/events");
if (fs.existsSync(evDir)) {
  for (const file of fs.readdirSync(evDir).filter(f => f.endsWith(".js"))) {
    const ev = require(path.join(evDir, file));
    // v14: dùng Events enum thay string thô — Events.ClientReady, Events.MessageCreate, v.v.
    // Event name vẫn là string từ module nên giữ logic cũ, chỉ fix ready → clientReady
    const evName = ev.name === 'ready' ? Events.ClientReady : ev.name;
    if (ev.once) client.once(evName, (...a) => ev.execute(...a, client));
    else client.on(evName, (...a) => ev.execute(...a, client));
    events.push(ev.name);
  }
}

// ── In bảng load đẹp ──────────────────────────────────────────────────────────
printLoadTable({ commands: cmdNames, contexts: ctxNames, events });

(async () => {
  try {
    // Kết nối MongoDB
    await connectDB();

    initSpamControl();

    // In banner sau khi login thành công (handler trong ready.js)
    client.once(Events.ClientReady, async (c) => {
      // Deploy commands sau khi client ready — truyền guild IDs từ cache
      const guildIds = c.guilds.cache.map(g => g.id);
      await deployCommands(guildIds);
      printDeploy(MODE, cmdNames.length + ctxNames.length);

      printBanner(c.user.tag);
      sysLog('READY', `Serving ${c.guilds.cache.size} guild(s) · ${c.users.cache.size} cached users`);

      // Khởi chạy Guild War Cronjob
      const guildWar = new GuildWarService(c);
      guildWar.startCron();

      // Khởi chạy Club Activity auto-fetch scheduler
      const clubActivity = new ClubActivityService(c);
      const clubScheduler = new ClubActivityScheduler(clubActivity);
      clubScheduler.start();

      // Khởi chạy REST API cho Dashboard Fuma-Nama Next.js
      startDashboardApi(c, clubActivity);
    });

    client.login(process.env.TOKEN);
  } catch (error) {
    sysLog('FATAL', `Startup failed: ${error.message}`, require('chalk').default.hex('#ED4245'));
    console.error(error);
    process.exit(1);
  }
})();

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
async function gracefulShutdown(signal) {
  sysLog('SHUTDOWN', `${signal} received — shutting down gracefully...`);
  try {
    client.destroy();
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    sysLog('SHUTDOWN', 'MongoDB disconnected. Goodbye! 👋');
  } catch (e) {
    console.error('[Shutdown] Error:', e);
  }
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ── Unhandled Errors ──────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  sysLog('ERROR', `Unhandled Promise Rejection: ${reason}`, require('chalk').hex('#ED4245'));
  console.error(reason);
});

process.on('uncaughtException', (error) => {
  sysLog('FATAL', `Uncaught Exception: ${error.message}`, require('chalk').hex('#ED4245'));
  console.error(error);
  // Cho process exit sau uncaught exception — không an toàn để tiếp tục
  process.exit(1);
});
