const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv/config');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;
const MODE = process.env.MODE || 'dev'; // 'dev' or 'prod'

async function deployCommands() {
    const commands = [];

    const loadCommands = (dir) => {
        const fullPath = path.join(__dirname, '..', dir);
        const files = fs.readdirSync(fullPath);

        for (const file of files) {
            const full = path.join(fullPath, file);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                loadCommands(path.join(dir, file));
            } else if (file.endsWith('.js')) {
                const command = require(path.join(__dirname, '..', dir, file));
                if (command.data) {
                    commands.push(command.data.toJSON());
                    console.log(`🔃 Found command: ${command.data.name}`);
                }
            }
        }
    };

    loadCommands('modules/commands');
    loadCommands('modules/contexts');

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        if (MODE === 'dev') {
            console.log(`🚧 [DEV MODE] Deploying to GUILD ${GUILD_ID}`);
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
                body: commands
            });
            // Optionally clean up global
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
        } else {
            console.log(`🌍 [PROD MODE] Deploying globally`);
            await rest.put(Routes.applicationCommands(CLIENT_ID), {
                body: commands
            });
        }

        console.log('✅ Commands deployed successfully.');
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
}

module.exports = deployCommands;
