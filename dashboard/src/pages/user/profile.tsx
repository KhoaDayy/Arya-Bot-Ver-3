import { avatarUrl, bannerUrl } from '@/api/discord';

import { profile } from '@/config/translations/profile';
import { IoLogOut } from 'react-icons/io5';
import { FaMoon, FaSun, FaCode, FaDiscord, FaShieldAlt, FaCrown } from 'react-icons/fa';
import { BsShieldCheck } from 'react-icons/bs';
import { useSettingsStore } from '@/stores';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { useLogoutMutation } from '@/utils/auth/hooks';
import { useSelfUser } from '@/api/hooks';
import { useGuilds, useBotGuildsQuery } from '@/api/hooks';
import { config } from '@/config/common';
import { iconUrl } from '@/api/discord';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LoadingPanel } from '@/components/panel/LoadingPanel';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const card = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Discord badge flags
const BADGES: { flag: number; label: string; icon: string }[] = [
  { flag: 1 << 0, label: 'Discord Staff', icon: '🛡️' },
  { flag: 1 << 1, label: 'Partner', icon: '🤝' },
  { flag: 1 << 2, label: 'HypeSquad Events', icon: '🎉' },
  { flag: 1 << 6, label: 'HypeSquad Bravery', icon: '💜' },
  { flag: 1 << 7, label: 'HypeSquad Brilliance', icon: '🧡' },
  { flag: 1 << 8, label: 'HypeSquad Balance', icon: '💚' },
  { flag: 1 << 9, label: 'Early Supporter', icon: '⭐' },
  { flag: 1 << 14, label: 'Bug Hunter Lv1', icon: '🐛' },
  { flag: 1 << 17, label: 'Verified Developer', icon: '🔧' },
  { flag: 1 << 18, label: 'Certified Moderator', icon: '🛡️' },
  { flag: 1 << 22, label: 'Active Developer', icon: '👨‍💻' },
];

const NITRO_TYPES: Record<number, string> = {
  1: 'Nitro Classic',
  2: 'Nitro',
  3: 'Nitro Basic',
};

const ProfilePage: NextPageWithLayout = () => {
  const user = useSelfUser();
  const logout = useLogoutMutation();
  const t = profile.useTranslations();
  const { theme, setTheme } = useTheme();

  const [devMode, setDevMode] = useSettingsStore((s) => [s.devMode, s.setDevMode]);
  const guilds = useGuilds();
  const botGuilds = useBotGuildsQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!user) {
    return <LoadingPanel />;
  }

  const isDark = mounted && theme === 'dark';
  const userBadges = BADGES.filter((b) => (user.public_flags ?? 0) & b.flag);
  const nitroLabel = NITRO_TYPES[user.premium_type ?? 0];
  const filteredGuilds = guilds.data?.filter((g) => config.guild.filter(g, user, botGuilds?.data));

  return (
    <motion.div className="w-full" variants={container} initial="hidden" animate="show">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ===== PROFILE HEADER — full width banner + avatar overlay ===== */}
        <motion.div variants={card} className="lg:col-span-12 rounded-2xl overflow-hidden
          bg-white border border-zinc-200 shadow-sm dark:bg-[#111] dark:border-white/10">

          {/* Banner */}
          <div className="relative h-40 md:h-52">
            {user.banner ? (
              <img
                src={bannerUrl(user.id, user.banner)}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-cyan-400 dark:to-indigo-500/80" />
            )}
            {/* Overlay gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#111]" />
          </div>

          {/* Avatar + Name row */}
          <div className="relative px-6 md:px-8 pb-6 -mt-14">
            <div className="flex items-end gap-5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 shadow-xl
                  border-white bg-white
                  dark:border-[#111] dark:bg-zinc-900"
              >
                <img src={avatarUrl(user)} alt={user.username} className="w-full h-full object-cover" />
              </motion.div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white truncate">{user.username}</h1>
                  {nitroLabel && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase
                      bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                      {nitroLabel}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">ID: {user.id}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => logout.mutate()}
                disabled={logout.isLoading}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150
                  bg-red-50 text-red-500 border border-red-200 hover:bg-red-100
                  dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20
                  disabled:opacity-50"
              >
                <IoLogOut size={16} /> {t.logout}
              </motion.button>
            </div>

            {/* Badges */}
            {userBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {userBadges.map((b) => (
                  <span key={b.flag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold
                    bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400"
                    title={b.label}>
                    <span>{b.icon}</span> {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ===== SETTINGS CARD — 7 cols ===== */}
        <motion.div variants={card} className="lg:col-span-7 rounded-2xl p-6
          bg-white border border-zinc-200 shadow-sm dark:bg-[#111] dark:border-white/10">
          <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-5">{t.settings}</p>

          <div className="flex flex-col gap-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border transition-colors duration-150
              bg-zinc-50 border-zinc-100 dark:bg-white/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {isDark ? <FaMoon size={15} /> : <FaSun size={15} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white">{t['dark mode']}</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{t['dark mode description']}</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`relative w-12 h-7 rounded-full transition-colors duration-150 ${isDark ? 'bg-cyan-500' : 'bg-zinc-300'}`}
              >
                <motion.div
                  animate={{ x: isDark ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>

            {/* Developer Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border transition-colors duration-150
              bg-zinc-50 border-zinc-100 dark:bg-white/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                  <FaCode size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white">{t['dev mode']}</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{t['dev mode description']}</p>
                </div>
              </div>
              <button
                onClick={() => setDevMode(!devMode)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-150 ${devMode ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <motion.div
                  animate={{ x: devMode ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>



            {/* Logout button (mobile) */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => logout.mutate()}
              disabled={logout.isLoading}
              className="sm:hidden flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150
                bg-red-50 text-red-500 border border-red-200 hover:bg-red-100
                dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20
                disabled:opacity-50"
            >
              <IoLogOut size={16} /> {t.logout}
            </motion.button>
          </div>
        </motion.div>

        {/* ===== RIGHT COLUMN — 5 cols ===== */}
        {/* Account Info */}
        <motion.div variants={card} className="lg:col-span-5 rounded-2xl p-6
          bg-white border border-zinc-200 shadow-sm dark:bg-[#111] dark:border-white/10">
          <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-4">Account Info</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: FaDiscord, label: 'Username', value: user.username, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { icon: BsShieldCheck, label: '2FA', value: user.mfa_enabled ? 'Đã bật' : 'Chưa bật', color: user.mfa_enabled ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400', bg: user.mfa_enabled ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10' },
              { icon: FaCrown, label: 'Nitro', value: nitroLabel ?? 'Không có', color: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
              { icon: FaShieldAlt, label: 'Locale', value: user.locale?.toUpperCase() ?? 'N/A', color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border transition-colors
                bg-zinc-50 border-zinc-100 dark:bg-white/5 dark:border-white/10">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${item.bg} ${item.color}`}>
                  <item.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">{item.label}</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== CONNECTED SERVERS — full width ===== */}
        <motion.div variants={card} className="lg:col-span-12 rounded-2xl p-6
          bg-white border border-zinc-200 shadow-sm dark:bg-[#111] dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse bg-indigo-500 dark:bg-cyan-400" />
            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Connected Servers</p>
            <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-600 ml-auto">{filteredGuilds?.length ?? 0} servers</span>
          </div>
          {guilds.status === 'success' && filteredGuilds && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {filteredGuilds.map((guild, idx) => (
                <motion.div key={guild.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-colors
                    bg-zinc-50 border-zinc-100 dark:bg-white/5 dark:border-white/10">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-white/10">
                    <img src={iconUrl(guild)} alt={guild.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{guild.name}</p>
                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">Connected</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;
export default ProfilePage;
