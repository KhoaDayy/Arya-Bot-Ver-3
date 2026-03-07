import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { LoadingPanel } from '@/components/panel/LoadingPanel';
import { QueryStatus } from '@/components/panel/QueryPanel';
import { config } from '@/config/common';
import { guild as view } from '@/config/translations/guild';
import { BsMailbox, BsFillTrophyFill, BsListCheck, BsPeopleFill, BsCalendarCheck, BsLightningChargeFill } from 'react-icons/bs';
import { FaRobot, FaFire, FaMedal } from 'react-icons/fa';
import { FiSettings, FiExternalLink, FiChevronDown } from 'react-icons/fi';
import { useGuildInfoQuery, useGuildWarListQuery, useGuildWarRankQuery, useUpdateGuildWarLaneMutation } from '@/api/hooks';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { CustomGuildInfo } from '@/config/types/custom-types';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import { useTheme } from 'next-themes';

const GuildPage: NextPageWithLayout = () => {
  const t = view.useTranslations();
  const guild = useRouter().query.guild as string;
  const query = useGuildInfoQuery(guild);

  return (
    <QueryStatus query={query} loading={<LoadingPanel />} error={t.error.load}>
      {!guild ? <LoadingPanel /> : query.data != null ? <CompactDesktopDashboard guild={guild} info={query.data} /> : <NotJoined guild={guild} />}
    </QueryStatus>
  );
};

// ═══════════════════════════════════════════════════════════
// ██  CLEAN PC DASHBOARD (Light/Dark SaaS Aesthetic)
// ═══════════════════════════════════════════════════════════
function CompactDesktopDashboard({ guild: id, info }: { guild: string; info: CustomGuildInfo }) {
  const t = view.useTranslations();
  const warList = useGuildWarListQuery(id);
  const warRank = useGuildWarRankQuery(id);

  const signups = warList.data?.data.length ?? 0;
  const topPlayer = warRank.data?.data[0];
  const participants = warRank.data?.data.length ?? 0;
  const weekNum = warList.data?.week?.split('-W')[1] ?? '?';

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full flex-col flex gap-0 text-zinc-900 dark:text-zinc-50 antialiased selection:bg-indigo-500/30">

      {/* ─── HEADER / HERO ─── */}
      <div className="border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-transparent z-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-wider text-indigo-700 dark:text-indigo-300 uppercase">System Active</span>
            </div>
            <h1 className="flex flex-col gap-1 text-3xl md:text-4xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
              <span>{t.banner.title}</span>
              <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-500 dark:from-cyan-400 dark:to-indigo-400">
                Command Center
              </span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              {t.banner.description} Quản lý lịch trình, phân chia vị trí đi đường và theo dõi thành tích Guild War trực tiếp từ đây.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/guilds/${id}/settings`} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm text-zinc-700 dark:text-zinc-300">
              <FiSettings size={14} /> Cài đặt
            </Link>
            <Link href={`/guilds/${id}/features/guiwar`} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-white dark:hover:bg-zinc-200 border border-transparent text-white dark:text-black shadow-sm">
              <BsLightningChargeFill size={14} className="text-indigo-200 dark:text-zinc-500" /> Cấu hình Guild War
            </Link>
          </div>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 flex flex-col gap-8"
      >

        {/* ─── METRICS ROW ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <motion.div variants={fadeInUp}><MetricCard title="Báo danh tuần" value={warList.isLoading ? '...' : signups} subtitle={`Tuần ${weekNum}`} icon={BsPeopleFill} /></motion.div>
          <motion.div variants={fadeInUp}><MetricCard title="Tổng thành viên" value={warRank.isLoading ? '...' : participants} subtitle="Đã tham gia" icon={BsFillTrophyFill} /></motion.div>
          <motion.div variants={fadeInUp}><MetricCard title="Top tham gia" value={warRank.isLoading ? '...' : topPlayer ? topPlayer.totalWars : 0} subtitle="Trận lớn nhất" icon={FaFire} trend="+ Chăm chỉ" /></motion.div>
          <motion.div variants={fadeInUp}><MetricCard title="Trạng thái" value="Online" subtitle="Hệ thống ổn định" icon={FaRobot} trend="Chạy tốt" trendPositive /></motion.div>
        </div>

        {/* ─── DATA GRID (Table + Charts) ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">

          {/* Main Table (Left 8 cols) */}
          <motion.div variants={fadeInUp} className="xl:col-span-8 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10">
                  <BsListCheck size={16} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Danh Sách Báo Danh</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Tuần {weekNum}</p>
                </div>
              </div>
              <Link href={`/guilds/${id}/gw-members`} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                Quản lý thành viên <FiExternalLink />
              </Link>
            </div>
            <div className="flex-1 p-2 md:p-6">
              <WarListTable guild={id} />
            </div>
          </motion.div>

          {/* Charts (Right 4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-6 md:gap-8">
            <motion.div variants={fadeInUp} className="flex-1 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Phân tích Lane</h3>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center">
                <LaneChart guild={id} />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex-1 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Tỉ lệ Role</h3>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center">
                <RoleChart guild={id} />
              </div>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, trendPositive }: any) {
  return (
    <div className="flex flex-col p-5 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</span>
        <div className="text-zinc-400 dark:text-zinc-500"><Icon size={16} /></div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">{value}</div>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${trendPositive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
              {trend}
            </span>
          )}
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ██  WAR LIST TABLE
// ═══════════════════════════════════════════════════════════
function WarListTable({ guild }: { guild: string }) {
  const q = useGuildWarListQuery(guild);

  if (q.isLoading) return <Loader />;
  if (q.isError) return <p className="text-red-400">Lỗi hệ thống</p>;
  if (!q.data?.data.length) return <EmptyState msg="Hệ thống chưa ghi nhận báo danh tuần này." />;

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-white/5">
            <th className="py-5 px-4 text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Discord Username</th>
            <th className="py-5 px-4 text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Tên Ingame</th>
            <th className="py-5 px-4 text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Lịch Tham Gia</th>
            <th className="py-5 px-4 text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Vị trí</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {q.data.data.map((item, i) => (
            <tr key={i} className="group border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-5 px-4">
                <span className="font-mono text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 px-2.5 py-1.5 rounded-md">{item.userId}</span>
              </td>
              <td className="py-5 px-4 flex flex-col justify-center items-start gap-1.5 min-h-[4rem]">
                <span className="font-semibold text-zinc-900 dark:text-white text-base">{item.ingameName || <span className="text-zinc-400 dark:text-zinc-600 italic">Unidentified</span>}</span>
                <RoleBadge role={item.role} />
              </td>
              <td className="py-5 px-4">
                <div className="flex gap-2">
                  {item.days.map((d: string) => (
                    <span key={d} className={`px-2.5 py-1 rounded text-[11px] uppercase font-bold tracking-wider
                      ${d === 'T7'
                        ? 'bg-blue-100 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'}`}>
                      {d === 'T7' ? 'SAT' : 'SUN'}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-5 px-4">
                <LaneSelect guildId={guild} weekId={q.data?.week || ''} userId={item.rawUserId || ''} currentLane={item.lane || ''} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════
// ██  CHARTS
// ═══════════════════════════════════════════════════════════
function LaneChart({ guild }: { guild: string }) {
  const q = useGuildWarListQuery(guild);
  if (q.isLoading || q.isError || !q.data?.data.length) return <div className="h-[200px] flex items-center justify-center"><EmptyState msg="No data" /></div>;

  const regs = q.data.data;
  const cnt = (v: string) => regs.filter(r => r.lane === v).length;
  const data = [
    { name: 'TOP', value: cnt('Top (Đường Trên)'), color: '#38bdf8' },
    { name: 'JGL', value: cnt('Jungle (Đi Rừng)'), color: '#4ade80' },
    { name: 'MID', value: cnt('Mid (Đường Giữa)'), color: '#f472b6' },
    { name: 'BOT', value: cnt('Bot (Đường Dưới)'), color: '#a78bfa' },
  ];

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: 'rgba(161,161,170,0.1)' }}
            contentStyle={{ backgroundColor: 'var(--tooltip-bg, #ffffff)', borderColor: 'var(--tooltip-border, #e4e4e7)', borderRadius: '12px', color: 'var(--tooltip-text, #18181b)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: 'var(--tooltip-text, #18181b)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RoleChart({ guild }: { guild: string }) {
  const q = useGuildWarListQuery(guild);
  if (q.isLoading || q.isError || !q.data?.data.length) return <div className="h-[200px] flex items-center justify-center"><EmptyState msg="No data" /></div>;

  const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const counts = new Map<string, number>();
  q.data.data.forEach(r => { const role = (r.role || '').trim(); if (role) counts.set(role, (counts.get(role) || 0) + 1); });
  const data = Array.from(counts.entries()).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

  return (
    <div className="h-[240px] flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--tooltip-bg, #ffffff)', borderColor: 'var(--tooltip-border, #e4e4e7)', borderRadius: '12px', color: 'var(--tooltip-text, #18181b)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--tooltip-text, #18181b)', fontSize: '13px', fontWeight: 'bold' }}
              formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0} thành viên`, name ?? 'Unknown']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 px-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[80px]" title={entry.name}>
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ██  HELPERS
// ═══════════════════════════════════════════════════════════
function RoleBadge({ role }: { role?: string }) {
  if (!role) return null;
  const lowerRole = role.toLowerCase();

  let colorClass = 'text-zinc-600 border-zinc-300 bg-zinc-100 dark:text-zinc-400 dark:border-zinc-500/30 dark:bg-white/5';

  if (lowerRole.includes('dps')) {
    colorClass = 'text-red-700 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-400/30 dark:bg-red-400/10';
  } else if (lowerRole.includes('healer') || lowerRole.includes('buff')) {
    colorClass = 'text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-400/30 dark:bg-green-400/10';
  } else if (lowerRole.includes('tank')) {
    colorClass = 'text-blue-700 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-400/30 dark:bg-blue-400/10';
  } else if (lowerRole.includes('flex')) {
    colorClass = 'text-purple-700 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-400/30 dark:bg-purple-400/10';
  }

  return (
    <span className={`px-2 py-0.5 border rounded text-[9px] uppercase tracking-widest font-bold ${colorClass}`}>
      {role}
    </span>
  );
}

function Loader() { return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-cyan-400 animate-spin" /></div>; }
function EmptyState({ msg }: { msg: string }) { return <div className="py-12 flex flex-col items-center opacity-40"><BsMailbox size={32} className="mb-4" /><p className="text-sm font-mono">{msg}</p></div>; }

function LaneSelect({ guildId, weekId, userId, currentLane }: { guildId: string; weekId: string; userId: string; currentLane: string }) {
  const mut = useUpdateGuildWarLaneMutation();
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative inline-block w-full max-w-[140px]">
      <select
        value={currentLane}
        disabled={mut.isLoading || loading}
        onChange={async (e) => {
          try {
            setLoading(true);
            await mut.mutateAsync({ guild: guildId, weekId, userId, lane: e.target.value });
          } finally { setLoading(false); }
        }}
        className="w-full appearance-none bg-zinc-100/50 hover:bg-zinc-200/80 border border-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 transition-colors cursor-pointer"
      >
        <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">-- Select --</option>
        <option value="Top (Đường Trên)" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">TOP</option>
        <option value="Jungle (Đi Rừng)" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">JUNGLE</option>
        <option value="Mid (Đường Giữa)" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">MID</option>
        <option value="Bot (Đường Dưới)" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">BOT</option>
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
        {loading || mut.isLoading ? <div className="w-3 h-3 border-2 border-t-transparent border-indigo-500 dark:border-cyan-400 rounded-full animate-spin" /> : <FiChevronDown size={14} />}
      </div>
    </div>
  );
}

function NotJoined({ guild }: { guild: string }) {
  const t = view.useTranslations();
  return (
    <div className="min-h-[80vh] bg-zinc-50 dark:bg-[#050505] flex items-center justify-center p-6 text-zinc-900 dark:text-white text-center rounded-2xl border border-zinc-200 dark:border-white/10 m-4">
      <div className="max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 flex items-center justify-center">
          <BsMailbox size={32} className="text-zinc-500" />
        </div>
        <h2 className="text-3xl font-black tracking-tight mb-4">{t.error['not found']}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">{t.error['not found description']}</p>
        <a href={`${config.inviteUrl}&guild_id=${guild}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-indigo-600 dark:bg-white text-white dark:text-black font-bold tracking-wide transition-transform hover:scale-105">
          <FaRobot /> {t.bn.invite}
        </a>
      </div>
    </div>
  );
}

GuildPage.getLayout = (c) => getGuildLayout({ children: c });
export default GuildPage;
