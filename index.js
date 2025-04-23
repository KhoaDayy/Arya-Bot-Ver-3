require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const deployCommands = require("./utils/deployCommands");
const { fancyLog, initSpamControl } = require("./utils/consoleLogger");
const { connectDB } = require("./db/connect");

const IGNORE_KEYWORDS = ["bot", "spam"];
const IGNORED_CHANNEL = process.env.IGNORED_CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
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
  for (const file of fs.readdirSync(evDir).filter((f) => f.endsWith(".js"))) {
    const ev = require(path.join(evDir, file));
    if (ev.once) client.once(ev.name, (...a) => ev.execute(...a, client));
    else client.on(ev.name, (...a) => ev.execute(...a, client));
    events.push(ev.name);
  }
}

console.log(`📦 Loaded Commands (${cmdNames.length}): ${cmdNames.join(", ")}`);
console.log(
  `📂 Loaded Context Menus (${ctxNames.length}): ${ctxNames.join(", ")}`
);
console.log(`⚙️ Registered Events (${events.length}): ${events.join(", ")}`);

(async () => {
  // Kết nối MongoDB trước khi deploy và login
  await connectDB();

  console.log("🌐 Deploying Application Commands...");
  await deployCommands();
  console.log(`✅ Deployed (${cmdNames.length + ctxNames.length}) commands:`);
  console.log(`   • Commands: ${cmdNames.join(", ")}`);
  console.log(`   • Context Menus: ${ctxNames.join(", ")}`);

  initSpamControl();

  client.on("messageCreate", async (m) => {
    if (
      m.author.bot ||
      m.channel.type === "DM" ||
      m.channel.id === IGNORED_CHANNEL
    )
      return;
    const ch = (m.channel.name || "").toLowerCase();
    if (IGNORE_KEYWORDS.some((k) => ch.includes(k))) return;
    await fancyLog({
      serverName: m.guild?.name || "DM",
      channelName: m.channel.name || "Unknown",
      userName: m.member?.displayName || m.author.username,
      content: m.content || "<media>",
    });
  });

  client.login(process.env.TOKEN);
})();
