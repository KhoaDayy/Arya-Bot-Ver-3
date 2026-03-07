import { useActiveSidebarItem, SidebarItemInfo } from '@/utils/router';
import { useGuilds, useSelfUserQuery, useBotGuildsQuery } from '@/api/hooks';
import { useMemo, useState } from 'react';
import { config } from '@/config/common';
import { FiSettings as SettingsIcon } from 'react-icons/fi';
import { avatarUrl } from '@/api/discord';
import { GuildItem, GuildItemsSkeleton } from './GuildItem';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SidebarItem } from './SidebarItem';
import items from '@/config/sidebar-items';

export function SidebarContent() {
  const [filter, setFilter] = useState('');
  const guilds = useGuilds();
  const { guild: selectedGroup } = useRouter().query as {
    guild: string;
  };

  const user = useSelfUserQuery();
  const botGuilds = useBotGuildsQuery();

  const filteredGuilds = useMemo(
    () =>
      guilds.data?.filter((guild) => {
        const contains = guild.name.toLowerCase().includes(filter.toLowerCase());
        return config.guild.filter(guild, user?.data, botGuilds?.data) && contains;
      }),
    [guilds.data, filter, user?.data, botGuilds?.data]
  );

  return (
    <>
      {/* Logo + Bot Name */}
      <div className="flex items-center gap-3 px-4 py-4 mx-3 my-4 rounded-2xl relative overflow-hidden group
        bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200/50 shadow-sm
        dark:from-blue-600/20 dark:to-cyan-500/20 dark:border-cyan-500/20 dark:shadow-[0_4px_20px_rgba(34,211,238,0.15)]">
        <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none transition-colors duration-200
          bg-indigo-500/5 group-hover:bg-indigo-500/10
          dark:bg-white/5 dark:group-hover:bg-cyan-500/10" />
        <div className="flex w-10 h-10 rounded-xl items-center justify-center shrink-0 border
          bg-white border-indigo-200/50
          dark:bg-[#0a0a0a] dark:border-white/10">
          {config.icon?.({ w: 5, h: 5 }) || <div className="w-5 h-5 bg-indigo-500 dark:bg-cyan-400 rounded-sm" />}
        </div>
        <div className="relative z-10 w-full">
          <h2 className="text-lg font-black tracking-widest leading-none uppercase
            text-indigo-900 dark:text-white dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {config.name}
          </h2>
          <p className="text-[10px] font-mono font-medium tracking-widest uppercase mt-1
            text-indigo-500/80 dark:text-cyan-400/80">
            Dashboard
          </p>
        </div>
      </div>

      <div className="flex flex-col mb-auto gap-0 mt-2">
        <Items />

        {/* Server Section */}
        <div className="px-4 pt-6 pb-2">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase
            text-zinc-400 dark:text-zinc-500">
            Connected Servers
          </p>
        </div>
        <div className="px-3 pb-3">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-mono
                bg-zinc-100 border border-zinc-200 text-zinc-700 placeholder:text-zinc-400
                focus:outline-none focus:border-indigo-400 focus:shadow-sm
                dark:bg-white/[0.04] dark:border-white/10 dark:text-zinc-300 dark:placeholder:text-zinc-600
                dark:focus:border-cyan-500/50 dark:focus:shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full
              bg-indigo-400/50 group-hover:bg-indigo-500
              dark:bg-cyan-500/50 dark:group-hover:bg-cyan-400 dark:group-hover:shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
          </div>
        </div>

        <div className="flex flex-col px-3 gap-1">
          {filteredGuilds == null ? (
            <GuildItemsSkeleton />
          ) : (
            filteredGuilds?.map((guild) => (
              <GuildItem
                key={guild.id}
                guild={guild}
                active={selectedGroup === guild.id}
                href={`/guilds/${guild.id}`}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export function BottomCard() {
  const user = useSelfUserQuery().data;
  if (user == null) return <></>;

  return (
    <div className="sticky left-0 bottom-0 w-full p-4 backdrop-blur-md z-20
      border-t border-zinc-200/50 bg-white/80
      dark:border-white/5 dark:bg-[#0a0a0a]/80">
      <div className="flex items-center px-3 py-2.5 rounded-xl gap-3 group
        bg-zinc-50 border border-zinc-200/50 hover:border-zinc-300
        dark:bg-white/[0.03] dark:border-white/5 dark:hover:border-white/10">
        <div className="relative w-9 h-9 shrink-0">
          <img src={avatarUrl(user)} alt={user.username} className="w-full h-full rounded-full
            ring-2 ring-white group-hover:ring-indigo-400
            dark:ring-black dark:group-hover:ring-cyan-500/30" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2
            border-white dark:border-black" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate
            text-zinc-900 dark:text-white">{user.username}</p>
          <p className="text-[10px] text-green-500 dark:text-green-400 font-mono uppercase tracking-widest mt-0.5">Online</p>
        </div>
        <Link href="/user/profile" className="p-2 rounded-lg
          text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50
          dark:text-zinc-500 dark:hover:text-cyan-400 dark:hover:bg-cyan-500/10">
          <SettingsIcon size={18} />
        </Link>
      </div>
    </div>
  );
}

function Items() {
  const active = useActiveSidebarItem();

  return (
    <div className="flex flex-col px-3 gap-1 pt-1">
      {items
        .filter((item) => !item.hidden)
        .map((route: SidebarItemInfo, index: number) => (
          <SidebarItem
            key={index}
            href={route.path}
            name={route.name}
            icon={route.icon}
            active={active === route}
          />
        ))}
    </div>
  );
}
