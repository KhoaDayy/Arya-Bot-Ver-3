import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { flushSync } from 'react-dom';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const isDark = theme === 'dark';

    const handleToggle = () => {
        const nextTheme = isDark ? 'light' : 'dark';

        if (!document.startViewTransition) {
            setTheme(nextTheme);
            return;
        }

        document.startViewTransition(() => {
            flushSync(() => {
                setTheme(nextTheme);
            });
        });
    };

    return (
        <button
            onClick={handleToggle}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border transition-colors duration-150 group
        border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-600
        dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/10 dark:text-zinc-400
        hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            aria-label="Toggle theme"
        >
            <div className="relative flex items-center justify-center w-5 h-5">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={theme === 'light' ? 'light' : 'dark'}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className={theme === 'light' ? 'text-amber-500' : 'text-cyan-400'}
                    >
                        {theme === 'light' ? <IoMdSunny className="w-5 h-5" /> : <IoMdMoon className="w-5 h-5" />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </button>
    );
}
