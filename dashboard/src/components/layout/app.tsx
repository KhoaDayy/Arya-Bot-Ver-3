import { useSelfUserQuery } from '@/api/hooks';
import { ReactNode } from 'react';
import { DefaultNavbar } from './navbar/default';
import { Sidebar, SidebarResponsive } from './sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePageStore } from '@/stores';
import { motion } from 'framer-motion';

export default function AppLayout({
  navbar,
  children,
  sidebar,
}: {
  navbar?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  const query = useSelfUserQuery();
  const setSidebarOpen = usePageStore((s) => s.setSidebarIsOpen);

  return (
    <div className="relative flex h-screen w-full overflow-hidden font-sans
      bg-zinc-50 text-zinc-900 selection:bg-indigo-500/20
      dark:bg-[#0a0a0a] dark:text-white dark:selection:bg-cyan-500/30">

      {/* Background Grid (dark only) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden dark:block opacity-20
          bg-[linear-gradient(to_right,#1b1b1b_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1b_1px,transparent_1px)]
          bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]
          transition-opacity duration-700"
      />

      {/* Light mode subtle dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 block dark:hidden opacity-30
          bg-[radial-gradient(circle,#00000010_1px,transparent_1px)]
          bg-[size:24px_24px] transition-opacity duration-700"
      />

      {/* Sidebar - Desktop */}
      <aside className="hidden xl:flex flex-col w-72 h-full z-20 flex-shrink-0 relative
        bg-white/80 backdrop-blur-2xl border-r border-zinc-200/80
        dark:bg-[#0a0a0a]/80 dark:backdrop-blur-3xl dark:border-r dark:border-white/10 dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <Sidebar sidebar={sidebar} />
      </aside>

      {/* Sidebar - Mobile (Drawer) */}
      <div className="xl:hidden z-50">
        <SidebarResponsive sidebar={sidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">

        {/* Top Bar (Navbar + Theme toggle + Hamburger) */}
        <header className="sticky top-0 z-30 w-full px-4 py-3 xl:py-5 xl:px-10
          border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl
          dark:border-white/5 dark:bg-[#0a0a0a]/80 dark:backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-lg transition-colors
                text-zinc-500 hover:bg-zinc-100
                dark:text-zinc-400 dark:hover:bg-white/5"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>

            {/* Navbar Content */}
            <div className="flex-1 min-w-0">
              {navbar ?? <DefaultNavbar />}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Page Content with entrance animation */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 xl:p-10
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full">
          <motion.div
            className="max-w-[1400px] mx-auto w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {query.isLoading ? (
              <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 dark:border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 dark:border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-indigo-400/50 dark:border-b-cyan-300/50 animate-[spin_1.5s_linear_infinite_reverse]" />
                  <div className="w-4 h-4 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)] dark:shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                </div>
                <div className="flex flex-col items-center gap-1.5 font-mono tracking-widest uppercase">
                  <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-cyan-400 dark:to-blue-500 tracking-[0.2em] ml-1">
                    System Boot
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-indigo-400 dark:bg-cyan-400" />
                    Connecting to core...
                  </span>
                </div>
              </div>
            ) : query.isError ? (
              <div className="w-full p-4 border rounded-lg font-mono text-sm
                border-red-300 bg-red-50 text-red-600
                dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                ERR_USER_DATA_UNAVAILABLE: Authentication context lost.
              </div>
            ) : (
              children
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
