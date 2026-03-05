import { deepmerge } from 'deepmerge-ts';
import { AccessToken } from '@/utils/auth/server';
import { Options } from './core';

const discord_api_endpoint = 'https://discord.com/api/v9';

/**
 * Bot API requests now go through the Next.js proxy at /api/bot/...
 * This means:
 * - No CORS issues (same origin)
 * - API key hidden on server
 * - Works identically on local and production
 * - Session is verified server-side by the proxy
 */
export function botRequest<T extends Options>(_session: AccessToken, options: T): T {
  return {
    ...options,
    origin: '/api/bot',
    request: deepmerge(
      {
        credentials: 'include' as RequestCredentials,
      },
      options.request
    ),
  };
}

export function discordRequest<T extends Options>(accessToken: string, options: T): T {
  return {
    ...options,
    origin: discord_api_endpoint,
    request: deepmerge(
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      options.request
    ),
  };
}
