import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeSwitch({ secondary }: { secondary?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      className={`p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors ${secondary ? 'text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle color mode"
    >
      {theme === 'light' ? <IoMdMoon className="w-[18px] h-[18px]" /> : <IoMdSunny className="w-[18px] h-[18px]" />}
    </button>
  );
}
