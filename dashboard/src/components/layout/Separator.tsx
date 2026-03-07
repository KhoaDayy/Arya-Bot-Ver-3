import { ReactNode } from 'react';

export function HSeparator({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-3 my-2 px-2">
      <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
      <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">{children}</span>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}
