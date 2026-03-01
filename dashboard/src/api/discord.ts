import { logout } from '@/utils/auth/hooks';
import { callReturn } from '@/utils/fetch/core';
import { discordRequest } from '@/utils/fetch/requests';

export type UserInfo = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
};

export type Guild = {
  id: string;
  name: string;
  icon: string;
  permissions: string;
};

export type IconHash = string;

export enum PermissionFlags {
  CREATE_INSTANT_INVITE = 2 ** 0,
  KICK_MEMBERS = 2 ** 1,
  BAN_MEMBERS = 2 ** 2,
  ADMINISTRATOR = 2 ** 3,
  MANAGE_CHANNELS = 2 ** 4,
  MANAGE_GUILD = 2 ** 5,
  ADD_REACTIONS = 2 ** 6,
  VIEW_AUDIT_LOG = 2 ** 7,
  PRIORITY_SPEAKER = 2 ** 8,
  STREAM = 2 ** 9,
  VIEW_CHANNEL = 2 ** 10,
  SEND_MESSAGES = 2 ** 11,
  SEND_TTS_MESSAGES = 2 ** 12,
  MANAGE_MESSAGES = 2 ** 13,
  EMBED_LINKS = 2 ** 14,
  ATTACH_FILES = 2 ** 15,
  READ_MESSAGE_HISTORY = 2 ** 16,
  MENTION_EVERYONE = 2 ** 17,
  USE_EXTERNAL_EMOJIS = 2 ** 18,
  VIEW_GUILD_INSIGHTS = 2 ** 19,
  CONNECT = 2 ** 20,
  SPEAK = 2 ** 21,
  MUTE_MEMBERS = 2 ** 22,
  DEAFEN_MEMBERS = 2 ** 23,
  MOVE_MEMBERS = 2 ** 24,
  USE_VAD = 2 ** 25,
  CHANGE_NICKNAME = 2 ** 26,
  MANAGE_NICKNAMES = 2 ** 27,
  MANAGE_ROLES = 2 ** 28,
  MANAGE_WEBHOOKS = 2 ** 29,
  MANAGE_EMOJIS_AND_STICKERS = 2 ** 30,
  USE_APPLICATION_COMMANDS = 2 ** 31,
  REQUEST_TO_SPEAK = 2 ** 32,
  MANAGE_EVENTS = 2 ** 33,
  MANAGE_THREADS = 2 ** 34,
  CREATE_PUBLIC_THREADS = 2 ** 35,
  CREATE_PRIVATE_THREADS = 2 ** 36,
  USE_EXTERNAL_STICKERS = 2 ** 37,
  SEND_MESSAGES_IN_THREADS = 2 ** 38,
  USE_EMBEDDED_ACTIVITIES = 2 ** 39,
  MODERATE_MEMBERS = 2 ** 40,
}

export enum ChannelTypes {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
  GUILD_FORUM = 15,
}

export async function fetchUserInfo(accessToken: string) {
  return await callReturn<UserInfo>(
    `/users/@me`,
    discordRequest(accessToken, {
      request: {
        method: 'GET',
      },
      allowed: {
        401: async () => {
          await logout();

          throw new Error('Not logged in');
        },
      },
    })
  );
}

export async function getGuilds(accessToken: string) {
  return await callReturn<Guild[]>(
    `/users/@me/guilds`,
    discordRequest(accessToken, { request: { method: 'GET' } })
  );
}

export async function getGuild(accessToken: string, id: string) {
  return await callReturn<Guild>(
    `/guilds/${id}`,
    discordRequest(accessToken, { request: { method: 'GET' } })
  );
}

export function iconUrl(guild: Guild) {
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`;
}

export function avatarUrl(user: UserInfo) {
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=512`;
}

export function bannerUrl(id: string, banner: string): string {
  return `https://cdn.discordapp.com/banners/${id}/${banner}?size=1024`;
}
