import { ReactNode } from 'react';
import { useActiveSidebarItem } from '@/utils/router';
import { IoHome } from 'react-icons/io5';
import { FaChevronRight as ChevronRightIcon } from 'react-icons/fa';
import { common } from '@/config/translations/common';
import Link from 'next/link';

export function DefaultNavbar() {
  const activeItem = useActiveSidebarItem();
  const breadcrumb: Array<{ icon: ReactNode; text: ReactNode; href: string }> = [
    {
      icon: <IoHome className="text-indigo-500 dark:text-cyan-400" />,
      text: <common.T text="pages" />,
      href: '/user/home',
    },
  ];

  if (activeItem != null)
    breadcrumb.push({
      icon: activeItem.icon,
      text: <>{activeItem.name}</>,
      href: activeItem.path,
    });

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-1 [&::-webkit-scrollbar]:hidden
        text-zinc-400 dark:text-zinc-500">
        {breadcrumb.map((item, i) => (
          <div key={i} className="flex items-center shrink-0">
            <Link
              href={item.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-150
                bg-zinc-100 border border-zinc-200/50 hover:bg-zinc-200 hover:border-indigo-300 hover:text-indigo-600
                dark:bg-white/[0.03] dark:border-white/5 dark:hover:bg-white/10 dark:hover:border-cyan-500/30 dark:hover:text-cyan-400"
            >
              {item.icon}
              <span className="font-bold">{item.text}</span>
            </Link>
            {i < breadcrumb.length - 1 && (
              <ChevronRightIcon className="mx-3 text-zinc-300 dark:text-white/20 text-[10px]" />
            )}
          </div>
        ))}
      </nav>

      {/* Page Title */}
      <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3
        text-zinc-900 dark:text-white">
        {activeItem ? (
          <>
            <span className="text-indigo-500 dark:text-cyan-500">{'>'}</span>
            {activeItem.name}
            <span className="w-2 h-6 inline-block ml-1 animate-pulse rounded-sm
              bg-indigo-500 shadow-md
              dark:bg-cyan-400 dark:shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          </>
        ) : (
          <div className="w-1/3 h-8 rounded-md animate-pulse
            bg-zinc-200 dark:bg-white/5" />
        )}
      </h1>
    </div>
  );
}
