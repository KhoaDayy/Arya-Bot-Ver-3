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

// User IDs được phép truy cập Dashboard dù không phải Admin server
const DASHBOARD_ADMINS = [
  '859281355392417824', // Hasu
  '330239277449347075', // shiro
];

export const config: AppConfig = {
  name: 'Arya Bot',
  icon: BotIcon,
  inviteUrl:
    'https://discord.com/oauth2/authorize?client_id=1468604087015575840&permissions=268453888&integration_type=0&scope=bot',
  guild: {
    filter: (guild, user, botGuilds) => {
      const isBotInGuild = botGuilds?.includes(guild.id);
      const isAdmin = (Number(guild.permissions) & PermissionFlags.ADMINISTRATOR) !== 0;
      const isDashAdmin = DASHBOARD_ADMINS.includes(user?.id ?? '');

      // Admin server: hiện tất cả server mình là admin
      // DASHBOARD_ADMINS: chỉ hiện server có bot tham gia
      return isAdmin || (isDashAdmin && !!isBotInGuild);
    },
  },
};
