import { Guild, iconUrl } from '@/api/discord';
import Link from 'next/link';

export function GuildItem({
  guild,
  active,
  href,
}: {
  guild: Guild;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 border-l-2 ${active
        ? 'bg-indigo-50 border-indigo-500 shadow-sm dark:bg-white/5 dark:border-cyan-500 dark:shadow-[inset_20px_0_20px_-20px_rgba(34,211,238,0.2)]'
        : 'border-transparent hover:bg-zinc-50 hover:border-zinc-300 dark:hover:bg-white/[0.04] dark:hover:border-white/20'
        }`}
    >
      <div className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 transition-all duration-200 border ${active
        ? 'border-indigo-400 shadow-md scale-105 dark:shadow-[0_0_12px_rgba(34,211,238,0.6)] dark:border-cyan-500/50'
        : 'border-zinc-200 group-hover:scale-110 group-hover:border-zinc-300 dark:border-white/10 dark:group-hover:border-white/30'
        }`}>
        <img src={iconUrl(guild)} alt={guild.name} className="w-full h-full object-cover bg-zinc-900" />
      </div>
      <span
        className={`text-sm truncate flex-1 transition-colors duration-200 ${active
          ? 'font-bold text-indigo-600 dark:text-cyan-400 dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]'
          : 'font-medium text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-white'
          }`}
      >
        {guild.name}
      </span>
      {active && (
        <div className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse
          bg-indigo-500
          dark:bg-cyan-400 dark:shadow-[0_0_8px_rgba(34,211,238,1)]" />
      )}
    </Link>
  );
}

export function GuildItemsSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl animate-pulse
          bg-zinc-100 dark:bg-white/[0.01]">
          <div className="w-8 h-8 rounded-full shrink-0 border
            bg-zinc-200 border-zinc-200
            dark:bg-white/5 dark:border-white/5" />
          <div className="h-3.5 flex-1 rounded-md
            bg-zinc-200 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}
