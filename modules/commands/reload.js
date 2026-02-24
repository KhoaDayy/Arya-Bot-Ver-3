// modules/commands/reload.js
// Reload một hoặc tất cả commands mà không cần restart bot
// Dùng Node.js require cache invalidation để re-require file

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { requireOwner } = require('../../utils/guards');
const { sysLog } = require('../../utils/consoleLogger');
const path = require('path');
const fs = require('fs');

const COMMANDS_DIR = path.join(__dirname);
const CONTEXTS_DIR = path.join(__dirname, '..', 'contexts');

/**
 * Tìm file .js chứa command có tên `cmdName` trong một thư mục
 * @returns {string|null} absolute path nếu tìm thấy
 */
function findCommandFile(dir, cmdName) {
    if (!fs.existsSync(dir)) return null;
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.js')) continue;
        const fullPath = path.join(dir, file);
        try {
            // Peek vào exported data.name mà không cần require toàn bộ module
            // (tránh side effects) — đọc tên từ cache nếu có
            const cached = require.cache[require.resolve(fullPath)];
            const name = cached?.exports?.data?.name;
            if (name === cmdName) return fullPath;

            // Nếu chưa trong cache: require tạm để lấy tên, sau đó xóa cache
            const mod = require(fullPath);
            delete require.cache[require.resolve(fullPath)];
            if (mod?.data?.name === cmdName) return fullPath;
        } catch { /* skip invalid files */ }
    }
    return null;
}

/**
 * Reload 1 command: xóa cache → require lại → update collection
 * @returns {{ ok: boolean, name: string, error?: string }}
 */
function reloadOne(client, cmdName) {
    // Tìm trong commands rồi contexts
    const filePath = findCommandFile(COMMANDS_DIR, cmdName)
        ?? findCommandFile(CONTEXTS_DIR, cmdName);

    if (!filePath) {
        return { ok: false, name: cmdName, error: 'Không tìm thấy file' };
    }

    try {
        // Xóa khỏi require cache để force re-require
        delete require.cache[require.resolve(filePath)];
        const freshMod = require(filePath);

        if (!freshMod?.data || !freshMod?.execute) {
            return { ok: false, name: cmdName, error: 'Module không hợp lệ (thiếu data/execute)' };
        }

        // Cập nhật vào collection tương ứng
        if (client.commands.has(cmdName)) {
            client.commands.set(cmdName, freshMod);
        } else if (client.contexts.has(cmdName)) {
            client.contexts.set(cmdName, freshMod);
        } else {
            // Command mới chưa có trong collection → thêm vào commands
            client.commands.set(cmdName, freshMod);
        }

        return { ok: true, name: cmdName };
    } catch (err) {
        return { ok: false, name: cmdName, error: err.message };
    }
}

/**
 * Reload tất cả commands + contexts
 */
function reloadAll(client) {
    const results = [];

    const reloadDir = (dir, collection) => {
        if (!fs.existsSync(dir)) return;
        for (const file of fs.readdirSync(dir)) {
            if (!file.endsWith('.js')) continue;
            const fullPath = path.join(dir, file);
            try {
                delete require.cache[require.resolve(fullPath)];
                const mod = require(fullPath);
                if (mod?.data && mod?.execute) {
                    collection.set(mod.data.name, mod);
                    results.push({ ok: true, name: mod.data.name });
                }
            } catch (err) {
                results.push({ ok: false, name: file, error: err.message });
            }
        }
    };

    reloadDir(COMMANDS_DIR, client.commands);
    reloadDir(CONTEXTS_DIR, client.contexts);
    return results;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload command mà không cần restart bot (Owner only)')
        .addStringOption(opt =>
            opt.setName('command')
                .setDescription('Tên command cần reload (bỏ trống = reload tất cả)')
                .setRequired(false)
                .setAutocomplete(true)
        ),
    devOnly: true,
    category: '⚙️ Hệ thống (System)',

    // Autocomplete: gợi ý tên commands đang có
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const allNames = [
            ...interaction.client.commands.keys(),
            ...interaction.client.contexts.keys(),
        ].filter(n => n.toLowerCase().startsWith(focused)).slice(0, 25);

        await interaction.respond(allNames.map(n => ({ name: n, value: n })));
    },

    async execute(interaction) {
        if (await requireOwner(interaction)) return;

        const cmdName = interaction.options.getString('command')?.trim();

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // ── Reload tất cả ──────────────────────────────────────────────────
        if (!cmdName) {
            const results = reloadAll(interaction.client);
            const ok = results.filter(r => r.ok);
            const fail = results.filter(r => !r.ok);

            sysLog('RELOAD', `All commands reloaded by ${interaction.user.username} — ${ok.length} OK, ${fail.length} FAIL`);

            let reply = `✅ Đã reload **${ok.length}** command(s).`;
            if (fail.length > 0) {
                reply += `\n❌ **${fail.length}** lỗi:\n` +
                    fail.map(r => `• \`${r.name}\`: ${r.error}`).join('\n');
            }

            return interaction.editReply(reply);
        }

        // ── Reload 1 command ────────────────────────────────────────────────
        const result = reloadOne(interaction.client, cmdName);

        if (result.ok) {
            sysLog('RELOAD', `/${cmdName} reloaded by ${interaction.user.username}`);
            return interaction.editReply(`✅ Đã reload command \`/${cmdName}\` thành công.`);
        } else {
            return interaction.editReply(`❌ Reload \`/${cmdName}\` thất bại: ${result.error}`);
        }
    },
};
