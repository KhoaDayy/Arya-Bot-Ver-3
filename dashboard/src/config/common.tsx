import { Box } from '@chakra-ui/react';
import Image from 'next/image';
import { PermissionFlags } from '@/api/discord';
import { AppConfig } from './types';

const BOT_AVATAR_URL = 'https://cdn.discordapp.com/avatars/1468604087015575840/6665997965b49b30636b086bb80dfc58.png?size=128';

const BotIcon = (props: any) => (
  <Box {...props} w={props.w ?? 5} h={props.h ?? 5} position="relative" overflow="hidden" rounded="full">
    <Image
      src={BOT_AVATAR_URL}
      alt="Arya Bot"
      width={40}
      height={40}
      style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '9999px' }}
      priority
    />
  </Box>
);

// User IDs được phép truy cập Dashboard dù không phải Admin server
// Đọc từ biến môi trường NEXT_PUBLIC_DASHBOARD_ADMINS (phân tách bởi dấu phẩy)
const DASHBOARD_ADMINS: string[] = (process.env.NEXT_PUBLIC_DASHBOARD_ADMINS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

export const config: AppConfig = {
  name: 'Arya Bot',
  icon: BotIcon,
  inviteUrl:
    'https://discord.com/oauth2/authorize?client_id=1468604087015575840',
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
