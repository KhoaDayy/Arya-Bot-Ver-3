import { config } from '@/config/common';
import { useGuilds, useSelfUserQuery, useBotGuildsQuery } from '@/api/hooks';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { iconUrl } from '@/api/discord';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaDiscord, FaGamepad, FaImage, FaSearch, FaUserFriends, FaChartPie, FaTerminal, FaRocket, FaCog, FaBolt, FaUsers } from 'react-icons/fa';
import { BsStars, BsShieldCheck, BsActivity, BsClockHistory } from 'react-icons/bs';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};
const tile = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const features = [
  { icon: FaGamepad, title: 'Guild War', desc: 'Quản lý đăng ký Guild War, tự động post báo danh, ping lịch trận đấu.', lc: 'text-red-500', dc: 'dark:text-red-400', lb: 'bg-red-50', db: 'dark:bg-red-500/10' },
  { icon: FaImage, title: 'Face Converter', desc: 'Chuyển khuôn mặt từ phiên bản CN sang Global tự động.', lc: 'text-blue-500', dc: 'dark:text-blue-400', lb: 'bg-blue-50', db: 'dark:bg-blue-500/10', href: '/user/features/face-converter' },
  { icon: BsStars, title: 'AI Chat', desc: 'Chat AI thông minh với Arya, trả lời mọi câu hỏi trực tiếp trong server.', lc: 'text-amber-500', dc: 'dark:text-amber-400', lb: 'bg-amber-50', db: 'dark:bg-amber-500/10' },
  { icon: FaUserFriends, title: 'Player Lookup', desc: 'Tra cứu thông tin chi tiết của bất kỳ player WWM nào.', lc: 'text-purple-500', dc: 'dark:text-purple-400', lb: 'bg-purple-50', db: 'dark:bg-purple-500/10', href: '/user/features/player-lookup' },
  { icon: FaUsers, title: 'Community Face', desc: 'Duyệt kho Preset khuôn mặt đã được convert bởi cộng đồng người chơi.', lc: 'text-pink-500', dc: 'dark:text-pink-400', lb: 'bg-pink-50', db: 'dark:bg-pink-500/10', href: '/user/features/community-face' },
  { icon: FaSearch, title: 'Anime Search', desc: 'Tìm kiếm anime, xem thông tin, trailer và rating đầy đủ.', lc: 'text-cyan-500', dc: 'dark:text-cyan-400', lb: 'bg-cyan-50', db: 'dark:bg-cyan-500/10' },
];


const quickActions = [
  { icon: FaCog, label: 'Cấu hình Bot', hint: 'Tùy chỉnh prefix, ngôn ngữ, kênh...' },
  { icon: FaBolt, label: 'Guild War Setup', hint: 'Thiết lập kênh, vai trò, lịch đấu...' },
  { icon: FaTerminal, label: 'Command Logs', hint: 'Xem lịch sử lệnh gần đây.' },
  { icon: FaRocket, label: 'Deploy Update', hint: 'Cập nhật phiên bản mới nhất.' },
];

import { useQuery } from '@tanstack/react-query';

interface ChangelogRelease {
  ver: string;
  date: string;
  tag?: string;
  items: { text: string; type: string }[];
}

const tagColors: Record<string, string> = {
  feat: 'bg-green-500',
  fix: 'bg-amber-500',
  refactor: 'bg-blue-500',
  perf: 'bg-purple-500',
  chore: 'bg-zinc-500',
  ci: 'bg-indigo-500',
  update: 'bg-zinc-400',
};

const HomePage: NextPageWithLayout = () => {
  const guilds = useGuilds();
  const user = useSelfUserQuery();
  const botGuilds = useBotGuildsQuery();
  const AppIcon = config.icon;
  const filteredGuilds = guilds.data?.filter((g) => config.guild.filter(g, user?.data, botGuilds?.data));

  const { data: changelog = [] } = useQuery<ChangelogRelease[]>(
    ['changelog'],
    () => fetch('/api/changelog').then((r) => r.json()),
    { staleTime: 60_000 }
  );

  return (
    <motion.div className="w-full" variants={container} initial="hidden" animate="show">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-auto">

        {/* ===== HERO BANNER — spans 7 cols, 2 rows ===== */}
        <motion.div variants={tile}
          className="lg:col-span-7 lg:row-span-2 relative overflow-hidden rounded-2xl p-7 md:p-9 min-h-[280px] flex flex-col justify-between group
            bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-white
            dark:from-[#0c0c0c] dark:via-[#111] dark:to-[#0c0c0c] dark:border dark:border-white/10">
          {/* Glows */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none bg-white/15 group-hover:scale-125 transition-transform duration-700 dark:bg-cyan-500/10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-indigo-400/20 dark:bg-violet-500/10" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 h-full w-full">
            <div className="flex items-start gap-5 md:gap-7 flex-1">
              <motion.div whileHover={{ scale: 1.05, rotate: 3 }} transition={{ type: 'spring', stiffness: 300 }}
                className="shrink-0 flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl
                  bg-white/20 backdrop-blur border border-white/30 dark:bg-black dark:border-white/20">
                {AppIcon && <AppIcon className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" />}
              </motion.div>
              <div className="flex-1 max-w-lg space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{config.name}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase bg-white/20 border border-white/30 dark:bg-cyan-500/20 dark:border-cyan-500/50 dark:text-cyan-400">v3.0</span>
                </div>
                <p className="text-sm md:text-base text-white/90 dark:text-zinc-400 leading-relaxed font-medium">
                  Bot Discord đa chức năng — <b>Guild War</b>, <b>AI Chat</b>, <b>Player Lookup</b> và nhiều hơn nữa.
                </p>
                <div className="pt-2">
                  <motion.a whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    href={config.inviteUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-150
                      bg-white text-indigo-600 hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] dark:text-black dark:hover:bg-cyan-400 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    <FaDiscord size={18} /> Invite Bot
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Decorative Mockup Area (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col gap-3 w-[280px] shrink-0 transform rotate-2 hover:rotate-0 transition-transform duration-500 drop-shadow-2xl mr-4 translate-y-2">
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20">
                    {AppIcon ? <AppIcon className="w-full h-full text-white bg-indigo-500 p-1" /> : <div className="w-full h-full bg-indigo-500" />}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-white leading-none">Arya Bot</span>
                      <span className="px-1 py-[1px] rounded bg-indigo-500/80 text-[7px] font-bold uppercase tracking-wider leading-none text-white">APP</span>
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-3 text-[11px] text-white/90 font-mono leading-relaxed backdrop-blur-sm border border-black/10">
                  <span className="text-green-300 font-bold">✓ Báo danh thành công!</span><br />
                  <div className="mt-1 flex items-center gap-1 border-t border-white/10 pt-1">
                    <span className="text-white/60">Lane:</span>
                    <span className="font-semibold text-white">MID (Đường Giữa)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 p-2.5 rounded-xl ml-8 flex justify-between items-center group-hover:-translate-x-2 transition-transform duration-500">
                <div className="flex items-center gap-2 text-white/80">
                  <FaTerminal size={10} />
                  <span className="text-[10px] font-bold font-mono">/gw status</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="relative z-10 flex flex-wrap gap-2.5 mt-auto pt-5 border-t border-white/10">
            {[
              { icon: BsShieldCheck, val: '256-bit', label: 'Bảo mật' },
              { icon: BsActivity, val: '99.9%', label: 'Uptime' },
              { icon: BsClockHistory, val: '<200ms', label: 'Phản hồi' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 dark:bg-white/5 text-white/70 dark:text-zinc-400 text-[11px] font-mono">
                <s.icon size={11} /><span className="text-white font-bold">{s.val}</span><span>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== SYSTEM STATUS — 5 cols ===== */}
        <motion.div variants={tile}
          className="lg:col-span-5 flex flex-col justify-between rounded-2xl p-6
            bg-white border border-zinc-200/80 shadow-sm dark:bg-white/[0.02] dark:border-white/10">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">System Status</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-indigo-500 dark:text-cyan-400 leading-none">{filteredGuilds?.length ?? '—'}</span>
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mb-1">servers connected</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-mono text-green-600 dark:text-green-400 tracking-widest uppercase">All systems operational</span>
          </div>
        </motion.div>

        {/* ===== QUICK ACTIONS — 5 cols ===== */}
        <motion.div variants={tile}
          className="lg:col-span-5 flex flex-col rounded-2xl p-6
            bg-white border border-zinc-200/80 shadow-sm dark:bg-white/[0.02] dark:border-white/10">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-3">Quick Actions</p>
          <div className="flex flex-col gap-1.5 flex-1">
            {quickActions.map((a, i) => (
              <motion.button key={i} whileHover={{ x: 3 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors duration-150 group hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 dark:bg-white/5 dark:text-cyan-400 dark:group-hover:bg-cyan-500/10">
                  <a.icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{a.label}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{a.hint}</p>
                </div>
                <span className="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-400 dark:group-hover:text-cyan-400 transition-colors text-xs">→</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ===== FEATURES — 6 cards, each 4 cols ===== */}
        {features.map((f, i) => {
          const CardContent = (
            <>
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${f.lb} ${f.db} ${f.lc} ${f.dc} transition-colors`}>
                <f.icon size={17} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className={`font-bold text-sm ${f.href ? 'group-hover:text-indigo-600 dark:group-hover:text-cyan-400' : ''} text-zinc-900 dark:text-white mb-1 transition-colors`}>{f.title}</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed flex-1">{f.desc}</p>
              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-white/5">
                <span className={`text-[10px] font-bold tracking-widest uppercase text-zinc-300 dark:text-zinc-600 ${f.href ? 'group-hover:text-indigo-400 dark:group-hover:text-cyan-400' : ''} transition-colors`}>Tìm hiểu thêm →</span>
              </div>
            </>
          );

          return f.href ? (
            <Link href={f.href} key={i} passHref legacyBehavior>
              <motion.a variants={tile} whileHover={{ y: -3 }}
                className={`lg:col-span-4 flex flex-col p-5 rounded-2xl border cursor-pointer transition-all duration-150 group
                  bg-white border-zinc-200/80 shadow-sm hover:shadow-md dark:bg-white/[0.02] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.04]`}
              >
                {CardContent}
              </motion.a>
            </Link>
          ) : (
            <motion.div key={i} variants={tile} whileHover={{ y: -3 }}
              className={`lg:col-span-4 flex flex-col p-5 rounded-2xl border cursor-default transition-all duration-150 group
                bg-white border-zinc-200/80 shadow-sm hover:shadow-md dark:bg-white/[0.02] dark:border-white/10 dark:hover:border-white/20`}>
              {CardContent}
            </motion.div>
          );
        })}

        {/* ===== BOTTOM ROW: Update Log (6 cols) + Your Servers (6 cols) ===== */}
        <motion.div variants={tile}
          className="lg:col-span-6 rounded-2xl p-6
            bg-white border border-zinc-200/80 shadow-sm dark:bg-white/[0.02] dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Update Log</p>
            <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-600 tracking-wider">Changelog</span>
          </div>
          <div className="flex flex-col gap-4">
            {changelog.map((release: ChangelogRelease, ri: number) => (
              <motion.div key={ri} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + ri * 0.08 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-black text-zinc-900 dark:text-white">{release.ver}</span>
                  {release.tag && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                      {release.tag}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-600 ml-auto">{release.date}</span>
                </div>
                <div className="flex flex-col gap-1 pl-3 border-l-2 border-zinc-100 dark:border-white/5">
                  {release.items.slice(0, 5).map((item, ii) => (
                    <div key={ii} className="flex items-start gap-2 py-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${tagColors[item.type] ?? 'bg-zinc-400'}`} />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-1">{item.text}</span>
                    </div>
                  ))}
                  {release.items.length > 5 && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-3.5">+{release.items.length - 5} more</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={tile}
          className="lg:col-span-6 rounded-2xl p-6
            bg-white border border-zinc-200/80 shadow-sm dark:bg-white/[0.02] dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse bg-indigo-500 dark:bg-cyan-400 dark:shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Your Servers</p>
            <div className="flex-1 h-px bg-zinc-100 dark:bg-white/5 ml-2" />
          </div>

          {guilds.status === 'success' && (
            <div className="flex flex-col gap-2">
              {filteredGuilds?.map((guild, idx) => (
                <motion.div key={guild.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Link href={`/guilds/${guild.id}`}
                    className="group flex items-center gap-3 p-3 rounded-xl border transition-colors duration-150
                      bg-zinc-50 border-zinc-100 hover:bg-white hover:border-indigo-200 hover:shadow-sm
                      dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/[0.04] dark:hover:border-cyan-500/30">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border transition-colors duration-150
                      border-zinc-200 bg-white group-hover:border-indigo-400
                      dark:border-white/10 dark:bg-zinc-900 dark:group-hover:border-cyan-400 dark:group-hover:shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                      <img src={iconUrl(guild)} alt={guild.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate text-zinc-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-cyan-400 transition-colors">{guild.name}</h3>
                      <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        Open<span className="opacity-0 -translate-x-2 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">→</span>
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {guilds.status === 'loading' && (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[56px] rounded-xl animate-pulse bg-zinc-100 dark:bg-white/[0.02]" />
              ))}
            </div>
          )}

          {guilds.status === 'error' && (
            <button onClick={() => guilds.refetch()} className="px-4 py-2 rounded-lg font-mono tracking-widest text-xs transition-all
              bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
              Retry
            </button>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
};

HomePage.getLayout = (c) => <AppLayout>{c}</AppLayout>;
export default HomePage;
