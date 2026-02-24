//interactionCreate.js
const { loadConfig, saveConfig } = require("../../utils/statsConfig");
const { VoiceUser } = require("../../db/schemas");
const {
  ChannelType,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActivityType,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");

// WWM interactive handlers (Select Menu → Button → Modal flow)
const {
  handleWwmWeaponSelect,
  handleWwmGroupButton,
  handleWwmModalSubmit,
} = require('../commands/wwm-stats');

// Helper dùng chung để reply ephemeral → DRY, không lặp { ephemeral: true } 30+ lần
function replyEphemeral(interaction, content) {
  // Nếu đã replied (ví dụ do lỗi double-trigger), dùng followUp
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp({ content, flags: MessageFlags.Ephemeral });
  }
  return interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

const { Collection } = require("discord.js");
const cooldowns = new Collection();

function checkCooldown(commandName, userId, cooldownAmount, interaction) {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownMs = cooldownAmount * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownMs;
    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      replyEphemeral(interaction, `⏳ Vui lòng chờ, lệnh \`${commandName}\` đang hồi chiêu. Bạn có thể dùng lại vào <t:${expiredTimestamp}:T> (<t:${expiredTimestamp}:R>).`);
      return true; // Is on cooldown
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownMs);
  return false; // Not on cooldown
}

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {

    // ── Autocomplete ────────────────────────────────────────────────────────
    if (interaction.isAutocomplete()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd || typeof cmd.autocomplete !== 'function') return;
      try {
        await cmd.autocomplete(interaction);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
      return;
    }

    // ── WWM: StringSelectMenu (chọn vũ khí) ───────────────────────────────
    if (interaction.isStringSelectMenu() && interaction.customId === 'wwm_weapon_select') {
      try {
        await handleWwmWeaponSelect(interaction);
      } catch (e) {
        console.error('[wwm select]', e);
        await replyEphemeral(interaction, '❌ Đã có lỗi xảy ra, vui lòng thử lại.');
      }
      return;
    }

    // ── WWM: Button (nhóm stats) ───────────────────────────────────────────
    if (interaction.isButton() && interaction.customId.startsWith('wwm_grp:')) {
      try {
        await handleWwmGroupButton(interaction);
      } catch (e) {
        console.error('[wwm button]', e);
        await replyEphemeral(interaction, '❌ Đã có lỗi xảy ra, vui lòng thử lại.');
      }
      return;
    }

    // ── WWM: Modal submit (lưu stats) ─────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId.startsWith('wwm_modal:')) {
      try {
        await handleWwmModalSubmit(interaction);
      } catch (e) {
        console.error('[wwm modal]', e);
        await replyEphemeral(interaction, '❌ Đã có lỗi xảy ra, vui lòng thử lại.');
      }
      return;
    }

    // ── Modal: Đổi tên kênh voice ───────────────────────────────────────────

    if (interaction.isModalSubmit() && interaction.customId.startsWith("rename_voice_")) {
      const channelId = interaction.customId.slice("rename_voice_".length); // slice nhanh hơn split
      const newName = interaction.fields.getTextInputValue("newName");
      const ch = await interaction.guild.channels.fetch(channelId).catch(() => null);

      if (!ch) return replyEphemeral(interaction, "❌ Không tìm thấy kênh để đổi tên.");

      await ch.edit({ name: newName }).catch(console.error);
      // Chạy song song: đổi tên kênh + update DB không cần await tuần tự
      await VoiceUser.findOneAndUpdate(
        { guildId: interaction.guildId, userId: interaction.user.id },
        { channelName: newName },
        { upsert: true }
      );
      return replyEphemeral(interaction, `✏️ Đã đổi tên kênh thành **${newName}**.`);
    }

    // ── Modal: Giới hạn số người ────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId.startsWith("limit_")) {
      const channelId = interaction.customId.slice("limit_".length);
      const limit = parseInt(interaction.fields.getTextInputValue("limitInput"), 10);

      if (isNaN(limit) || limit < 0 || limit > 99) {
        return replyEphemeral(interaction, "❌ Giới hạn phải từ 0–99.");
      }

      const ch = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!ch) return replyEphemeral(interaction, "❌ Kênh không tìm thấy.");

      await ch.setUserLimit(limit).catch(console.error);
      return replyEphemeral(
        interaction,
        limit === 0 ? "✅ Đã bỏ giới hạn kênh." : `✅ Đã đặt giới hạn kênh thành **${limit}** người.`
      );
    }

    // ── Modal: Trạng thái kênh ──────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId.startsWith("status_")) {
      const channelId = interaction.customId.slice("status_".length);
      const status = interaction.fields.getTextInputValue("statusInput");
      const ch = await interaction.guild.channels.fetch(channelId).catch(() => null);

      if (!ch) return replyEphemeral(interaction, "❌ Không tìm thấy kênh để đặt trạng thái.");
      await ch.setStatus(status).catch(console.error);
      return replyEphemeral(interaction, `✅ Đã đặt trạng thái kênh thành **${status}**.`);
    }

    // ── Modal: Config stats channel ─────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "configStatsModal") {
      // v14: dùng PermissionFlagsBits thay string "Administrator"
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return replyEphemeral(interaction, "❌ Bạn cần quyền Quản trị viên để sử dụng.");
      }

      const cfg = loadConfig();
      const gid = interaction.guildId;
      cfg[gid] ??= {}; // v14+ / ES2021: nullish assignment thay vì if (!cfg[gid])
      cfg[gid].total = interaction.fields.getTextInputValue("totalChannel");
      cfg[gid].members = interaction.fields.getTextInputValue("membersChannel");
      cfg[gid].bots = interaction.fields.getTextInputValue("botsChannel");
      saveConfig(cfg);

      return replyEphemeral(interaction, "✅ Đã lưu cấu hình kênh thống kê!");
    }

    // ── Slash Commands ──────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const cooldownTime = command.cooldown || 3;
      if (checkCooldown(interaction.commandName, interaction.user.id, cooldownTime, interaction)) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`[Command Error] /${interaction.commandName}:`, err);
        // v14: kiểm tra cả deferred để tránh "already replied" error
        const errMsg = { content: "❌ Lỗi khi thực thi command.", flags: MessageFlags.Ephemeral };
        if (interaction.deferred) {
          await interaction.editReply(errMsg).catch(() => { });
        } else if (!interaction.replied) {
          await interaction.reply(errMsg).catch(() => { });
        }
      }
      return;
    }

    // ── Context Menus ───────────────────────────────────────────────────────
    if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
      const context = client.contexts.get(interaction.commandName);
      if (!context) return;

      const cooldownTime = context.cooldown || 3;
      if (checkCooldown(interaction.commandName, interaction.user.id, cooldownTime, interaction)) return;
      try {
        await context.execute(interaction);
      } catch (err) {
        console.error(`[Context Menu Error] ${interaction.commandName}:`, err);
        const errMsg = { content: "❌ Lỗi khi thực thi context menu.", flags: MessageFlags.Ephemeral };
        if (!interaction.replied) await interaction.reply(errMsg).catch(() => { });
      }
      return;
    }

    // ── Select Menus (Voice Config) ─────────────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      const [type, , channelId] = interaction.customId.split("_");
      const ch = await interaction.guild.channels.fetch(channelId).catch(() => null);

      if (!ch) return replyEphemeral(interaction, "❌ Kênh không tìm thấy!");

      const member = interaction.member;
      const choice = interaction.values[0];

      // ── Voice Config Menu ─────────────────────────────────────────────────
      if (type === "voice" && interaction.customId.startsWith("voice_config_")) {
        switch (choice) {
          case "name": {
            const nameModal = new ModalBuilder()
              .setCustomId(`rename_voice_${channelId}`)
              .setTitle("Đổi tên kênh voice");
            const nameInput = new TextInputBuilder()
              .setCustomId("newName")
              .setLabel("Tên mới cho kênh voice")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder("Nhập tên mới…");
            nameModal.addComponents(new ActionRowBuilder().addComponents(nameInput));
            return interaction.showModal(nameModal);
          }

          case "limit": {
            const limitModal = new ModalBuilder()
              .setCustomId(`limit_${channelId}`)
              .setTitle("Đặt giới hạn kênh voice");
            const limitInput = new TextInputBuilder()
              .setCustomId("limitInput")
              .setLabel("Giới hạn số người (0–99)")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder("Nhập số…");
            limitModal.addComponents(new ActionRowBuilder().addComponents(limitInput));
            return interaction.showModal(limitModal);
          }

          case "status":
            return replyEphemeral(interaction, "❌ Tính năng chưa hoạt động lúc này.");

          case "game": {
            const pres = interaction.member.presence;
            if (!pres?.activities?.length) {
              return replyEphemeral(interaction, "❌ Bạn chưa có hoạt động nào đang hiển thị.");
            }
            const activity = pres.activities.find(a => a.type === ActivityType.Playing) ?? pres.activities[0];
            const gameName = activity.name || activity.details || "Unknown";
            await ch.setName(`🎮 ${gameName}`).catch(console.error);
            return replyEphemeral(interaction, `🎲 Đã đổi tên kênh thành **${gameName}**`);
          }

          case "lfm":
            return replyEphemeral(interaction, "👥 LFM: Looking for members?");

          case "bitrate":
            await ch.setBitrate(96000);
            return replyEphemeral(interaction, "🔊 Bitrate đã được đặt 96kbps");

          case "text": {
            const txt = await interaction.guild.channels.create({
              name: `${member.displayName}-text`,
              type: ChannelType.GuildText,
              parent: ch.parentId,
              permissionOverwrites: ch.permissionOverwrites.cache.map(po => ({
                id: po.id,
                allow: po.allow.toArray(),
                deny: po.deny.toArray(),
              })),
            });
            return replyEphemeral(interaction, `✉️ Tạo kênh text: ${txt}`);
          }

          case "nsfw":
            await ch.setNSFW(true);
            return replyEphemeral(interaction, "🔞 Kênh đã chuyển NSFW");

          case "claim":
            await Promise.all([
              ch.permissionOverwrites.edit(interaction.guild.id, { Connect: false }),
              ch.permissionOverwrites.create(member, { ManageChannels: true, Connect: true }),
            ]);
            return replyEphemeral(interaction, "👑 Bạn đã claim kênh!");

          default:
            return replyEphemeral(interaction, "❌ Lựa chọn không hợp lệ.");
        }
      }

      // ── Voice Permit Menu ─────────────────────────────────────────────────
      if (type === "voice" && interaction.customId.startsWith("voice_permit_")) {
        // Map các action đơn giản vào { perms, msg } để tránh switch-case dài
        const PERMIT_ACTIONS = {
          lock: { perms: { Connect: false }, msg: "🔒 Đã khóa kênh!" },
          unlock: { perms: { Connect: true }, msg: "🔓 Đã mở khóa kênh!" },
          ghost: { perms: { ViewChannel: false, Connect: false }, msg: "👻 Kênh đã bị ẩn!" },
          unghost: { perms: { ViewChannel: true, Connect: true }, msg: "👀 Kênh đã được hiển thị lại!" },
        };

        if (PERMIT_ACTIONS[choice]) {
          await ch.permissionOverwrites.edit(interaction.guild.id, PERMIT_ACTIONS[choice].perms);
          return replyEphemeral(interaction, PERMIT_ACTIONS[choice].msg);
        }

        switch (choice) {
          case "permit":
            await ch.permissionOverwrites.create(member, { Connect: true });
            return replyEphemeral(interaction, `✅ Đã cho phép ${member.displayName}`);
          case "reject":
            await ch.permissionOverwrites.create(member, { Connect: false });
            return replyEphemeral(interaction, `⛔ Đã từ chối ${member.displayName}`);
          case "invite":
            return replyEphemeral(interaction, "🔗 Dùng `/voice invite @user` để mời thêm.");
          default:
            return replyEphemeral(interaction, "❌ Lựa chọn không hợp lệ.");
        }
      }
    }
  },
};
