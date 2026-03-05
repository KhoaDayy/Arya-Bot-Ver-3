import { CustomFeatures, CustomGuildInfo } from '../config/types';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { UserInfo, getGuild, getGuilds, fetchUserInfo } from '@/api/discord';
import {
  disableFeature,
  enableFeature,
  fetchGuildChannels,
  fetchGuildInfo,
  fetchGuildRoles,
  getFeature,
  updateFeature,
  fetchGuildWarList,
  fetchGuildWarRank,
  updateGuildWarLane,
  fetchBotGuilds,
  fetchGwMembers,
  updateGwMember,
  deleteGwMember,
  fetchClubConfig,
  fetchClubSnapshots,
  fetchClubSnapshot,
  forceClubFetch,
} from '@/api/bot';
import { GuildInfo } from '@/config/types';
import { useAccessToken, useSession } from '@/utils/auth/hooks';

export const client = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 0,
    },
  },
});

export const Keys = {
  login: ['login'],
  guild_info: (guild: string) => ['guild_info', guild],
  features: (guild: string, feature: string) => ['feature', guild, feature],
  guildRoles: (guild: string) => ['gulid_roles', guild],
  guildChannels: (guild: string) => ['gulid_channel', guild],
};

export const Mutations = {
  updateFeature: (guild: string, id: string) => ['feature', guild, id],
};

export function useGuild(id: string) {
  const accessToken = useAccessToken();

  return useQuery(['guild', id], () => getGuild(accessToken as string, id), {
    enabled: accessToken != null,
  });
}

export function useGuilds() {
  const accessToken = useAccessToken();

  return useQuery(['user_guilds'], () => getGuilds(accessToken as string), {
    enabled: accessToken != null,
  });
}

export function useBotGuildsQuery() {
  const { status, session } = useSession();

  return useQuery(['bot_guilds'], () => fetchBotGuilds(session!!), {
    enabled: status === 'authenticated',
    staleTime: 60000,
  });
}

export function useSelfUserQuery() {
  const accessToken = useAccessToken();

  return useQuery<UserInfo>(['users', 'me'], () => fetchUserInfo(accessToken!!), {
    enabled: accessToken != null,
    staleTime: Infinity,
  });
}

export function useGuildInfoQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery<CustomGuildInfo | null>(
    Keys.guild_info(guild),
    () => fetchGuildInfo(session!!, guild),
    {
      enabled: status === 'authenticated',
      refetchOnWindowFocus: true,
      retry: false,
      staleTime: 0,
    }
  );
}

export function useFeatureQuery<K extends keyof CustomFeatures>(guild: string, feature: K) {
  const { status, session } = useSession();

  return useQuery(Keys.features(guild, feature), () => getFeature(session!!, guild, feature), {
    enabled: status === 'authenticated',
  });
}

export type EnableFeatureOptions = { guild: string; feature: string; enabled: boolean };
export function useEnableFeatureMutation() {
  const { session } = useSession();

  return useMutation(
    async ({ enabled, guild, feature }: EnableFeatureOptions) => {
      if (enabled) return enableFeature(session!!, guild, feature);
      return disableFeature(session!!, guild, feature);
    },
    {
      async onSuccess(_, { guild, feature, enabled }) {
        await client.invalidateQueries(Keys.features(guild, feature));
        client.setQueryData<GuildInfo | null>(Keys.guild_info(guild), (prev) => {
          if (prev == null) return null;

          if (enabled) {
            return {
              ...prev,
              enabledFeatures: prev.enabledFeatures.includes(feature)
                ? prev.enabledFeatures
                : [...prev.enabledFeatures, feature],
            };
          } else {
            return {
              ...prev,
              enabledFeatures: prev.enabledFeatures.filter((f) => f !== feature),
            };
          }
        });
      },
    }
  );
}

export type UpdateFeatureOptions = {
  guild: string;
  feature: keyof CustomFeatures;
  options: FormData | string;
};
export function useUpdateFeatureMutation() {
  const { session } = useSession();

  return useMutation(
    (options: UpdateFeatureOptions) =>
      updateFeature(session!!, options.guild, options.feature, options.options),
    {
      onSuccess(updated, options) {
        const key = Keys.features(options.guild, options.feature);

        return client.setQueryData(key, updated);
      },
    }
  );
}

export function useGuildRolesQuery(guild: string) {
  const { session } = useSession();

  return useQuery(Keys.guildRoles(guild), () => fetchGuildRoles(session!!, guild));
}

export function useGuildChannelsQuery(guild: string) {
  const { session } = useSession();

  return useQuery(Keys.guildChannels(guild), () => fetchGuildChannels(session!!, guild));
}

export function useSelfUser(): UserInfo {
  return useSelfUserQuery().data!!;
}

export function useGuildPreview(guild: string) {
  const query = useGuilds();

  return {
    guild: query.data?.find((g) => g.id === guild),
    query,
  };
}

export function useGuildWarListQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery(['guiwar_list', guild], () => fetchGuildWarList(session!!, guild), {
    enabled: status === 'authenticated',
  });
}

export function useGuildWarRankQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery(['guiwar_rank', guild], () => fetchGuildWarRank(session!!, guild), {
    enabled: status === 'authenticated',
  });
}

export function useUpdateGuildWarLaneMutation() {
  const { session } = useSession();

  return useMutation(
    (options: { guild: string; userId: string; lane: string; weekId?: string }) =>
      updateGuildWarLane(session!!, options.guild, options.userId, options.lane, options.weekId),
    {
      onSuccess(_, options) {
        client.invalidateQueries(['guiwar_list', options.guild]);
        client.invalidateQueries(['gw_members', options.guild]);
      },
    }
  );
}

export function useGwMembersQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery(['gw_members', guild], () => fetchGwMembers(session!!, guild), {
    enabled: status === 'authenticated',
  });
}

export function useUpdateGwMemberMutation() {
  const { session } = useSession();

  return useMutation(
    (options: { guild: string; userId: string; data: { ingameName?: string; role?: string; lane?: string } }) =>
      updateGwMember(session!!, options.guild, options.userId, options.data),
    {
      onSuccess(_, options) {
        client.invalidateQueries(['gw_members', options.guild]);
      },
    }
  );
}

export function useDeleteGwMemberMutation() {
  const { session } = useSession();

  return useMutation(
    (options: { guild: string; userId: string }) =>
      deleteGwMember(session!!, options.guild, options.userId),
    {
      onSuccess(_, options) {
        client.invalidateQueries(['gw_members', options.guild]);
      },
    }
  );
}

// --- Club Activity Hooks ---

export function useClubConfigQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery(['club_config', guild], () => fetchClubConfig(session!!, guild), {
    enabled: status === 'authenticated',
  });
}

export function useClubSnapshotsQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery(['club_snapshots', guild], () => fetchClubSnapshots(session!!, guild), {
    enabled: status === 'authenticated',
  });
}

export function useClubSnapshotQuery(guild: string, week?: string) {
  const { status, session } = useSession();

  return useQuery(
    ['club_snapshot', guild, week || 'latest'],
    () => fetchClubSnapshot(session!!, guild, week),
    {
      enabled: status === 'authenticated',
    }
  );
}

export function useForceClubFetchMutation() {
  const { session } = useSession();

  return useMutation(
    (options: { guild: string }) => forceClubFetch(session!!, options.guild),
    {
      onSuccess(_, options) {
        client.invalidateQueries(['club_snapshots', options.guild]);
        client.invalidateQueries(['club_snapshot', options.guild]);
        client.invalidateQueries(['club_config', options.guild]);
      },
    }
  );
}
