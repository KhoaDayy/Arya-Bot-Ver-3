const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    PermissionsBitField
  } = require('discord.js');
  
  module.exports = {
    data: new ContextMenuCommandBuilder()
      .setName('User Info')
      .setType(ApplicationCommandType.User),
  
    async execute(interaction) {
      const user = interaction.targetUser;
      const member = await interaction.guild.members.fetch(user.id);
  
      // Tính Join Position
      const sortedJoins = interaction.guild.members.cache
        .filter(m => m.joinedTimestamp)
        .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
      const joinPosition = sortedJoins.map(m => m.id).indexOf(member.id) + 1;
  
      // Lấy danh sách roles (bỏ @everyone), sắp xếp theo position
      const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => r.toString());
  
      // Map các quyền quan trọng sang tên dễ đọc
      const permMap = {
        KickMembers: 'Kick Members',
        BanMembers: 'Ban Members',
        Administrator: 'Administrator',
        ManageChannels: 'Manage Channels',
        ManageGuild: 'Manage Server',
        ManageMessages: 'Manage Messages',
        MentionEveryone: 'Mention Everyone',
        ManageNicknames: 'Manage Nicknames',
        ManageRoles: 'Manage Roles',
        ManageWebhooks: 'Manage Webhooks',
        ManageEmojisAndStickers: 'Manage Emojis'
      };
      const keyPerms = member.permissions
        .toArray()
        .filter(p => permMap[p])
        .map(p => permMap[p]);
  
      const acks = [];
      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        acks.push('Server Admin');
      }
  
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(user.toString())
        .setURL(`https://discord.com/users/${user.id}`) // Link đến profile Discord
        .setColor('#5865F2')
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          {
            name: 'Joined',
            value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`,
            inline: true
          },
          {
            name: 'Join Position',
            value: `${joinPosition}`,
            inline: true
          },
          {
            name: 'Registered',
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`,
            inline: true
          },
          {
            name: `Roles [${roles.length}]`,
            value: roles.length ? roles.join(' ') : 'None'
          },
          {
            name: 'Key Permissions',
            value: keyPerms.length ? keyPerms.join(', ') : 'None'
          },
          {
            name: 'Acknowledgements',
            value: acks.length ? acks.join(', ') : 'None'
          }
        )
        .setFooter({ text: `ID: ${user.id}` })
        .setTimestamp();
  
      await interaction.reply({ embeds: [embed], ephemeral: false });
    }
  };
  