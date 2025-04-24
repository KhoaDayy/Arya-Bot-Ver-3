//voiceStateUpdate.js
const {
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { VoiceTemplate, VoiceParent, VoiceUser } = require('../../db/schemas');

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldState, newState, client) {
    // 1) Khi user JOIN một voice channel
    if (!oldState.channelId && newState.channelId) {
      const guildId = newState.guild.id;
      const tpl = await VoiceTemplate.findOne({ guildId });
      if (tpl && newState.channelId === tpl.templateId) {
        const member = newState.member;
        const templateCh = await newState.guild.channels.fetch(tpl.templateId);
        const userSetting = await VoiceUser.findOne({
          guildId: newState.guild.id,
          userId:  member.id
        });

        const nameToUse = userSetting?.channelName
            ? userSetting.channelName
            : `${member.displayName}'s channel`;
            const newCh = await newState.guild.channels.create({
              name:   nameToUse,
              type:   ChannelType.GuildVoice,
              parent: templateCh.parentId
            });
        
        // Ghi mapping kênh động
        await VoiceParent.create({
          channelId: newCh.id,
          parentId: templateCh.parentId,
        });
        // Di chuyển user vào kênh mới
        await member.voice.setChannel(newCh);

        // 4) Gửi menu quản lý cho user
        const embed = new EmbedBuilder()
          .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
          })
          .setTitle("🔊 Your Temporary Voice Channel")
          .setDescription(
            "Use the menu below to configure your channel settings:" +
              "\n• Lock / Unlock" +
              "\n• Permit / Reject" +
              "\n• Invite / Ghost / Unghost" +
              "\n• Change channel settings (Bitrate, Text, NSFW, Claim, Name, Limit, Status, Game, LFM)"
          )
          .setColor(0x5865f2)
          .setImage ('https://i.pinimg.com/originals/5f/96/b0/5f96b08e054d29dbfd8a0201da31c9b5.gif')

        const channelsetting = new StringSelectMenuBuilder()
          .setCustomId(`voice_config_${newCh.id}`)
          .setPlaceholder("Change Channel Setting:")
          .addOptions([
            {
              label: "Name",
              value: "name",
              description: "Đổi tên kênh.",
              emoji: { id: '1364644432703393884', name: 'rename' }
            },
            {
              label: "Limit",
              value: "limit",
              description: "Thay đổi user limit.",
              emoji: { id: '1364644494594805892', name: 'limit' }
            },
            {
              label: "Status",
              value: "status",
              description: "Set channel status.",
              emoji: { id: '1364644403142197320', name: 'status' }
            },
            {
              label: "Game",
              value: "game",
              description: "Đặt tên kênh theo game.",
              emoji: { id: '1364644514815283321', name: 'Games' }
            },
            {
              label: "LFM",
              value: "lfm",
              description: "Looking for members?",
              emoji: { id: '1364647843591225476', name: 'lfm' }
            },
            {
              label: "Bitrate",
              value: "bitrate",
              description: "Thay đổi bitrate kênh.",
              emoji: { id: '1364644545345749043', name: 'Bitrate' }
            },
            {
              label: "Text",
              value: "text",
              description: "Tạo kênh text tạm thời.",
              emoji: { id: '1364644394199683174', name: 'text' }
            },
            {
              label: "NSFW",
              value: "nsfw",
              description: "Chuyển kênh tạm thời thành NSFW.",
              emoji: { id: '1364644472100491437', name: 'NSFW' }
            },
            {
              label: "Claim",
              value: "claim",
              description: "Claim ownership of the channel.",
              emoji: { id: '1364648436460290108', name: 'claim' }
            }
          ])

        const channelpermit = new StringSelectMenuBuilder()
          .setCustomId(`voice_permit_${newCh.id}`)
          .setPlaceholder("Change Channel Permisson:")
          .addOptions([
            {
              label: "Lock",
              value: "lock",
              description: "Khóa kênh, chỉ bạn có thể vào.",
              emoji: { id: '1364644485413474374', name: 'lock' }
            },
            {
              label: "Unlock",
              value: "unlock",
              description: "Mở khóa kênh.",
              emoji: { id: '1364644381042278460', name: 'unlock' }
            },
            {
              label: "Permit",
              value: "permit",
              description: "Cho phép user/role vào kênh.",
              emoji: { id: '1364644457466691705', name: 'Permit' }
            },
            {
              label: "Reject",
              value: "reject",
              description: "Từ chối user/role vào kênh.",
              emoji: { id: '1364644445076848760', name: 'reject' }
            },
            {
              label: "Invite",
              value: "invite",
              description: "Mời thêm user vào kênh.",
              emoji: { id: '1364648325852434542', name: 'Invite' }
            },
            {
              label: "Ghost",
              value: "ghost",
              description: "Ẩn kênh khỏi mọi người.",
              emoji: { id: '1364647851917053962', name: 'ghost' }
            },
            {
              label: "Unghost",
              value: "unghost",
              description: "Hiện kênh trở lại.",
              emoji: { id: '1364647833852182580', name: 'unghost' }
            }
          ]);
        const row1 = new ActionRowBuilder().addComponents(channelsetting);
        const row2 = new ActionRowBuilder().addComponents(channelpermit);

        try {
          await newCh.send({ embeds: [embed], components: [row1, row2] });
        } catch (err) {
          console.error(`Không thể gửi DM cho ${member.user.tag}:`, err);
        }
      }
    }

      if (oldState.channelId && !newState.channelId) {
          const par = await VoiceParent.findOne({ channelId: oldState.channelId });
          if (par) {
            const oldCh = await oldState.guild.channels
              .fetch(oldState.channelId)
              .catch(() => null);
            if (!oldCh) return;
      
            const tpl = await VoiceTemplate.findOne({ guildId: oldState.guild.id });
      
            if (oldCh.members.size === 0 && oldCh.id !== tpl.templateId) {
              await oldCh.delete().catch(console.error);
              await VoiceParent.deleteOne({ channelId: oldState.channelId });
            }
          }
        }
  },
};
