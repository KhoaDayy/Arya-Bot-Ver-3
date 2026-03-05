const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv/config');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;
const MODE = process.env.MODE || 'dev';

/**
 * Deploy slash commands lên Discord.
 * @param {string[]} [guildIds] - Danh sách guild IDs (prod). Nếu không truyền, dùng GUILD_ID từ env (dev).
 */
async function deployCommands(guildIds) {
    const commands = [];

    const loadCommands = (dir) => {
        const fullPath = path.join(__dirname, '..', dir);
        for (const file of fs.readdirSync(fullPath)) {
            const full = path.join(fullPath, file);
            if (fs.statSync(full).isDirectory()) {
                loadCommands(path.join(dir, file));
            } else if (file.endsWith('.js')) {
                const command = require(path.join(__dirname, '..', dir, file));
                if (command.data) commands.push(command.data.toJSON());
            }
        }
    };

    loadCommands('modules/commands');
    loadCommands('modules/contexts');

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    if (MODE === 'dev') {
        // Dev: deploy chỉ test guild (instant)
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    } else {
        // Prod: deploy từng guild (instant) thay vì global (chờ 1 giờ)
        const ids = guildIds || [GUILD_ID];
        for (const id of ids) {
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, id), { body: commands });
        }
        // Xóa global commands nếu còn sót
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    }

    return commands.length;
}

module.exports = deployCommands;
