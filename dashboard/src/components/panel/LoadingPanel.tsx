import { common } from '@/config/translations/common';

export function LoadingPanel({ className }: { className?: string }) {
  const t = common.useTranslations();

  return (
    <div className={`w-full h-full min-h-[50vh] flex flex-col items-center justify-center gap-6 ${className || ''}`}>
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 dark:border-cyan-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 dark:border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-indigo-400/50 dark:border-b-cyan-300/50 animate-[spin_1.5s_linear_infinite_reverse]" />
        <div className="w-4 h-4 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)] dark:shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
      </div>
      <div className="flex flex-col items-center gap-1.5 font-mono tracking-widest uppercase">
        <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-cyan-400 dark:to-blue-500 tracking-[0.2em] ml-1">
          {t.loading}
        </span>
      </div>
    </div>
  );
}
