import Link from 'next/link';
import { ReactNode } from 'react';

export function SidebarItem({
  name,
  active,
  icon,
  href,
}: {
  name: ReactNode;
  icon: ReactNode;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl p-2 transition-colors duration-150 border ${active
        ? 'bg-indigo-50 border-indigo-200/50 shadow-sm dark:bg-white/[0.03] dark:border-white/5 dark:shadow-[0_0_15px_rgba(255,255,255,0.02)]'
        : 'border-transparent hover:bg-zinc-100 dark:hover:bg-white/[0.02]'
        }`}
    >
      <div
        className={`flex items-center justify-center p-2 rounded-xl border transition-colors duration-200 ${active
          ? 'bg-indigo-500 text-white border-indigo-400 shadow-md dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
          : 'bg-transparent border-zinc-200 text-zinc-500 group-hover:text-indigo-500 group-hover:border-indigo-300 dark:border-white/5 dark:text-zinc-500 dark:group-hover:text-cyan-400 dark:group-hover:border-white/10 dark:group-hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.2)]'
          }`}
      >
        {icon}
      </div>
      <span
        className={`text-sm tracking-wide transition-colors duration-200 ${active
          ? 'font-bold text-indigo-700 dark:text-white dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]'
          : 'font-medium text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300'
          }`}
      >
        {name}
      </span>
    </Link>
  );
}
