import { BottomCard, SidebarContent } from './SidebarContent';
import { AnimatePresence, motion } from 'framer-motion';
import { usePageStore } from '@/stores';
import { ReactNode } from 'react';

// Desktop Sidebar (Static Left Column)
export function Sidebar({ sidebar }: { sidebar?: ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full overflow-x-hidden overflow-y-auto
      [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/10
      [&::-webkit-scrollbar-thumb]:rounded-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sidebar == null ? 'default' : 'new'}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-1"
        >
          {sidebar ?? <SidebarContent />}
        </motion.div>
      </AnimatePresence>
      <div className="mt-auto">
        <BottomCard />
      </div>
    </div>
  );
}

// Mobile Responsive Sidebar (Slide-over Drawer)
export function SidebarResponsive({ sidebar }: { sidebar?: ReactNode }) {
  const [isOpen, setOpen] = usePageStore((s) => [s.sidebarIsOpen, s.setSidebarIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-[101] w-[285px] shadow-2xl flex flex-col
              bg-white border-r border-zinc-200
              dark:bg-[#0a0a0a] dark:border-r dark:border-white/10"
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors
                text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100
                dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="flex-1 overflow-x-hidden overflow-y-auto mt-12
              [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/10">
              {sidebar ?? <SidebarContent />}
            </div>

            <div className="mt-auto">
              <BottomCard />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
