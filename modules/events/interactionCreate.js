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
} = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("rename_voice_")
    ) {
      const channelId = interaction.customId.split("_")[2];
      const newName = interaction.fields.getTextInputValue("newName");
      const ch = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);
      if (!ch) {
        return interaction.reply({
          content: "❌ Không tìm thấy kênh để đổi tên.",
          ephemeral: true,
        });
      }
      await ch.edit({ name: newName }).catch(console.error);
      await VoiceUser.findOneAndUpdate(
        { guildId: interaction.guildId, userId: interaction.user.id },
        { channelName: newName },
        { upsert: true }
      );
      return interaction.reply({
        content: `✏️ Đã đổi tên kênh thành **${newName}**.`,
        ephemeral: true,
      });
    }
    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("limit_")
    ) {
      const channelId = interaction.customId.split("_")[1];
      const raw = interaction.fields.getTextInputValue("limitInput");
      const limit = parseInt(raw, 10);
      try {
        if (isNaN(limit) || limit < 0 || limit > 99) {
          return interaction.reply({
            content: "❌ Giới hạn phải từ 0–99.",
            ephemeral: true,
          });
        }
        const ch = await interaction.guild.channels
          .fetch(channelId)
          .catch(() => null);
        if (!ch) {
          return interaction.reply({
            content: "❌ Kênh không tìm thấy.",
            ephemeral: true,
          });
        }
        await ch.setUserLimit(limit).catch(console.error);
        return interaction.reply({
          content:
            limit === 0
              ? "✅ Đã bỏ giới hạn kênh."
              : `✅ Đã đặt giới hạn kênh thành **${limit}** người.`,
          ephemeral: true,
        });
      } catch (err) {
        console.error(err);
        return interaction.reply({
          content: "❌ Đã xảy ra lỗi khi đặt giới hạn.",
          ephemeral: true,
        });
      }
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("status_")
    ) {
      const channelId = interaction.customId.split("_")[1];
      const status = interaction.fields.getTextInputValue("statusInput");
      const ch = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);
      if (!ch) {
        return interaction.reply({
          content: "❌ Không tìm thấy kênh để đặt trạng thái.",
          ephemeral: true,
        });
      }
      await ch.setStatus(status).catch(console.error);
      return interaction.reply({
        content: `✅ Đã đặt trạng thái kênh thành **${status}**.`,
        ephemeral: true,
      });
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "configStatsModal"
    ) {
      if (!interaction.member.permissions.has("Administrator")) {
        return interaction.reply({
          content: "❌ Bạn cần quyền Quản trị viên để sử dụng.",
          ephemeral: true,
        });
      }
      const totalId = interaction.fields.getTextInputValue("totalChannel");
      const membersId = interaction.fields.getTextInputValue("membersChannel");
      const botsId = interaction.fields.getTextInputValue("botsChannel");

      const cfg = loadConfig();
      const gid = interaction.guildId;
      if (!cfg[gid]) cfg[gid] = {};
      cfg[gid].total = totalId;
      cfg[gid].members = membersId;
      cfg[gid].bots = botsId;
      saveConfig(cfg);

      return interaction.reply({
        content: "✅ Đã lưu cấu hình kênh thống kê!",
        ephemeral: true,
      });
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        if (!interaction.replied) {
          await interaction.reply({
            content: "❌ Lỗi khi thực thi command.",
            ephemeral: true,
          });
        }
      }
    } else if (
      interaction.isUserContextMenuCommand() ||
      interaction.isMessageContextMenuCommand()
    ) {
      const context = client.contexts.get(interaction.commandName);
      if (!context) return;
      try {
        await context.execute(interaction);
      } catch (err) {
        console.error(err);
        if (!interaction.replied) {
          await interaction.reply({
            content: "❌ Lỗi khi thực thi context menu.",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      const [type, , channelId] = interaction.customId.split("_");
      const ch = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);
      const member = interaction.member;
      const choice = interaction.values[0];
      if (!ch)
        return interaction.reply({
          content: "❌ Kênh không tìm thấy!",
          ephemeral: true,
        });
      if (
        type === "voice" &&
        interaction.customId.startsWith("voice_config_")
      ) {
        switch (choice) {
          case "name":
            const nameModal = new ModalBuilder()
              .setCustomId(`rename_voice_${channelId}`)
              .setTitle("Đổi tên kênh voice");

            const nameInput = new TextInputBuilder()
              .setCustomId("newName")
              .setLabel("Tên mới cho kênh voice")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder("Nhập tên mới…");
            const inputRow = new ActionRowBuilder().addComponents(nameInput);
            nameModal.addComponents(inputRow);
            await interaction.showModal(nameModal);
            return;
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

            const row = new ActionRowBuilder().addComponents(limitInput);
            limitModal.addComponents(row);

            await interaction.showModal(limitModal);
            return;
          }
          case "status":
            // const statusModal = new ModalBuilder()
            //   .setCustomId(`status_${channelId}`)
            //   .setTitle("Đặt trạng thái cho voice");

            // const statusInput= new TextInputBuilder()
            //     .setCustomId("statusInput")
            //     .setLabel("Trạng thái cho kênh voice")
            //     .setStyle(TextInputStyle.Short)
            //     .setRequired(true)
            //     .setPlaceholder("Nhập Trạng thái...")

            //     const statusRow = new ActionRowBuilder().addComponents(statusInput)
            // statusModal.addComponents(statusRow);
            await interaction.reply({
              content: "❌ Tính năng chưa hoạt động lúc này.",
              ephemeral: true,
            });
            return;
          case "game":
            // return interaction.reply({
            //   content: "🎲 Dùng `/voice game <tên game>` để đặt tên kênh.",
            //   ephemeral: true,
            // });
            const pres = interaction.member.presence;
            if (!pres?.activities?.length) {
              return interaction.reply({
                content: "❌ Bạn chưa có hoạt động nào đang hiển thị.",
                ephemeral: true,
              });
            }
            let activity = pres.activities.find(
              (a) => a.type === ActivityType.Playing
            );
            if (!activity) activity = pres.activities[0];

            const gameName = activity.name || activity.details || "Unknown";

            await ch.setName(`🎮 ${gameName}`).catch(console.error);

            return interaction.reply({
              content: `🎲 Đã đổi tên kênh thành **${gameName}**`,
              ephemeral: true,
            });
          case "lfm":
            return interaction.reply({
              content: "👥 LFM: Looking for members?",
              ephemeral: true,
            });
          case "bitrate":
            await ch.setBitrate(96000);
            return interaction.reply({
              content: "🔊 Bitrate đã được đặt 96kbps",
              ephemeral: true,
            });
          case "text": {
            const txt = await interaction.guild.channels.create({
              name: `${member.displayName}-text`,
              type: ChannelType.GuildText,
              parent: ch.parentId,
              permissionOverwrites: ch.permissionOverwrites.cache.map((po) => ({
                id: po.id,
                allow: po.allow.toArray(),
                deny: po.deny.toArray(),
              })),
            });
            return interaction.reply({
              content: `✉️ Tạo kênh text: ${txt}`,
              ephemeral: true,
            });
          }
          case "nsfw":
            await ch.setNSFW(true);
            return interaction.reply({
              content: "🔞 Kênh đã chuyển NSFW",
              ephemeral: true,
            });
          case "claim":
            await ch.permissionOverwrites.edit(interaction.guild.id, {
              Connect: false,
            });
            await ch.permissionOverwrites.create(member, {
              ManageChannels: true,
              Connect: true,
            });
            return interaction.reply({
              content: "👑 Bạn đã claim kênh!",
              ephemeral: true,
            });
          default:
            return interaction.reply({
              content: "❌ Lựa chọn không hợp lệ.",
              ephemeral: true,
            });
        }
      }

      if (
        type === "voice" &&
        interaction.customId.startsWith("voice_permit_")
      ) {
        switch (choice) {
          case "lock":
            await ch.permissionOverwrites.edit(interaction.guild.id, {
              Connect: false,
            });
            return interaction.reply({
              content: "🔒 Đã khóa kênh!",
              ephemeral: true,
            });
          case "unlock":
            await ch.permissionOverwrites.edit(interaction.guild.id, {
              Connect: true,
            });
            return interaction.reply({
              content: "🔓 Đã mở khóa kênh!",
              ephemeral: true,
            });
          case "permit":
            await ch.permissionOverwrites.create(member, { Connect: true });
            return interaction.reply({
              content: `✅ Đã cho phép ${member.displayName}`,
              ephemeral: true,
            });
          case "reject":
            await ch.permissionOverwrites.create(member, { Connect: false });
            return interaction.reply({
              content: `⛔ Đã từ chối ${member.displayName}`,
              ephemeral: true,
            });
          case "invite":
            return interaction.reply({
              content: "🔗 Dùng `/voice invite @user` để mời thêm.",
              ephemeral: true,
            });
          case "ghost":
            await ch.permissionOverwrites.edit(interaction.guild.id, {
              ViewChannel: false,
              Connect: false,
            });
            return interaction.reply({
              content: "👻 Kênh đã bị ẩn!",
              ephemeral: true,
            });
          case "unghost":
            await ch.permissionOverwrites.edit(interaction.guild.id, {
              ViewChannel: true,
              Connect: true,
            });
            return interaction.reply({
              content: "👀 Kênh đã được hiển thị lại!",
              ephemeral: true,
            });
          default:
            return interaction.reply({
              content: "❌ Lựa chọn không hợp lệ.",
              ephemeral: true,
            });
        }
      }
    }
  },
};
