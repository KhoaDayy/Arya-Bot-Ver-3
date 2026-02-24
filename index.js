require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const deployCommands = require("./utils/deployCommands");
const { fancyLog, initSpamControl, sysLog, printBanner, printLoadTable, printDeploy } = require("./utils/consoleLogger");
const { connectDB } = require("./db/connect");

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

    // Deploy commands
    await deployCommands();
    printDeploy(MODE, cmdNames.length + ctxNames.length);

    initSpamControl();

    // In banner sau khi login thành công (handler trong ready.js)
    client.once(Events.ClientReady, (c) => {
      printBanner(c.user.tag);
      sysLog('READY', `Serving ${c.guilds.cache.size} guild(s) · ${c.users.cache.size} cached users`);
    });

    client.login(process.env.TOKEN);
  } catch (error) {
    sysLog('FATAL', `Startup failed: ${error.message}`, require('chalk').default.hex('#ED4245'));
    console.error(error);
    process.exit(1);
  }
})();
