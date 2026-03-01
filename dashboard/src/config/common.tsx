import { Box, Image } from '@chakra-ui/react';
import { PermissionFlags } from '@/api/discord';
import { AppConfig } from './types';

const BOT_AVATAR_URL = 'https://cdn.discordapp.com/avatars/1468604087015575840/6665997965b49b30636b086bb80dfc58.png?size=128';

const BotIcon = (props: any) => (
  <Box {...props} w={props.w ?? 5} h={props.h ?? 5}>
    <Image
      src={BOT_AVATAR_URL}
      alt="Arya Bot"
      rounded="full"
      w="full"
      h="full"
      objectFit="cover"
    />
  </Box>
);

export const config: AppConfig = {
  name: 'Arya Bot',
  icon: BotIcon,
  inviteUrl:
    'https://discord.com/oauth2/authorize?client_id=1468604087015575840&permissions=268453888&integration_type=0&scope=bot',
  guild: {
    //filter guilds that user has no permissions to manage it
    filter: (guild, user, botGuilds) => {
      const isBotInGuild = botGuilds?.includes(guild.id);
      const isAdmin = (Number(guild.permissions) & PermissionFlags.ADMINISTRATOR) !== 0;

      return isAdmin || !!isBotInGuild;
    },
  },
};
