// modules/commands/upt.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const os = require('os');
const osu = require('os-utils');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const { dependencies = {}, devDependencies = {} } = require(path.join(__dirname, '..', '..', 'package.json'));

function getCPUUsage() {
  return new Promise(resolve => osu.cpuUsage(v => resolve((v * 100).toFixed(2))));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upt')
    .setDescription('Hiển thị thông tin hệ thống của bot')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  category: '⚙️ Tiện ích (Utility)',
  async execute(interaction) {
    // Only administrators can use
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Bạn cần quyền Quản trị viên để sử dụng lệnh này.', flags: 64 });
    }

    // Defer reply hidden
    await interaction.deferReply({ flags: 64 });

    // Gather stats
    const totalDeps = Object.keys(dependencies).length;
    const totalDevDeps = Object.keys(devDependencies).length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const uptimeSec = process.uptime();
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = Math.floor(uptimeSec % 60);
        // Calculate total project directory size
    let fileSize = 'N/A';
    try {
      // Recursively sum file sizes
      async function getFolderSize(dir) {
        let total = 0;
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            total += await getFolderSize(fullPath);
          } else {
            const st = await fs.promises.stat(fullPath);
            total += st.size;
          }
        }
        return total;
      }
      const projectDir = path.join(__dirname, '..', '..');
      const bytes = await getFolderSize(projectDir);
      const mb = bytes / 1024 / 1024;
      fileSize = mb < 1
        ? `${(bytes / 1024).toFixed(2)} KB`
        : `${mb.toFixed(2)} MB`;
    } catch {}
    const cpuUsage = await getCPUUsage();

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle('📊 Uptime')
      .setColor(0x00AE86)
      .addFields(
        { name: '🕒 Thời gian', value: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD/MM/YYYY'), inline: true },
        { name: '⏲️ Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '📦 Dependencies', value: `${totalDeps}`, inline: true },
        { name: '🔧 DevDependencies', value: `${totalDevDeps}`, inline: true },
        { name: '🖥️ Hệ điều hành', value: `${os.type()} ${os.release()}`, inline: false },
        { name: '💻 CPU', value: `${os.cpus().length} cores (${os.cpus()[0].model.trim()})`, inline: true },
        { name: '🔄 CPU Usage', value: `${cpuUsage}%`, inline: true },
        { name: '💾 RAM', value: `${(usedMem/1024/1024/1024).toFixed(2)}GB / ${(totalMem/1024/1024/1024).toFixed(2)}GB`, inline: false },
        { name: '📂 Bot File Size', value: fileSize, inline: true },
        { name: '👤 Requested by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    // Send embed as edit
    await interaction.editReply({ embeds: [embed] });
  }
};
