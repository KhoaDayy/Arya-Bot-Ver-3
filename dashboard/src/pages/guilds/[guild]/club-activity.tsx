import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
    BsPeopleFill, BsFillTrophyFill, BsSearch, BsDownload, BsFunnel,
    BsExclamationTriangleFill, BsLightningChargeFill
} from 'react-icons/bs';
import { FaSortUp, FaSortDown, FaSort, FaSync, FaCrown, FaShieldAlt, FaStar, FaFire } from 'react-icons/fa';
import {
    useClubConfigQuery,
    useClubSnapshotsQuery,
    useClubSnapshotQuery,
    useForceClubFetchMutation,
} from '@/api/hooks';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import type { ClubMemberSnapshot } from '@/config/types/custom-types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ──────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 25;

const POSITION_OPTIONS = [
    { value: '', label: '' },
    { value: 'Guild Leader', label: 'Guild Leader' },
    { value: 'Vice Leader', label: 'Vice Leader' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Moderator', label: 'Halftime' },
    { value: 'Apprentice', label: 'Apprentice' },
    { value: 'Members', label: 'Members' },
];
const ACTIVITY_FILTER_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Dưới 1000', value: 'low' },
    { label: 'Trên 1000', value: 'high' },
];

// ─── Position colors ─────────────────────────────────────────────────────────

type ColorDef = { tailwind: string, bg: string, text: string, border: string };

const TAILWIND_COLORS: Record<string, ColorDef> = {
    yellow: { tailwind: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/20' },
    cyan: { tailwind: 'cyan', bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-500/20' },
    purple: { tailwind: 'purple', bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20' },
    orange: { tailwind: 'orange', bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20' },
    blue: { tailwind: 'blue', bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
    gray: { tailwind: 'gray', bg: 'bg-zinc-100 dark:bg-white/5', text: 'text-zinc-700 dark:text-zinc-400', border: 'border-zinc-200 dark:border-white/10' },
    pink: { tailwind: 'pink', bg: 'bg-pink-100 dark:bg-pink-500/10', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-500/20' },
    teal: { tailwind: 'teal', bg: 'bg-teal-100 dark:bg-teal-500/10', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-500/20' },
    green: { tailwind: 'green', bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-500/20' },
    red: { tailwind: 'red', bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
    indigo: { tailwind: 'indigo', bg: 'bg-indigo-100 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/20' },
};

const POSITION_COLORS: Record<string, { color: string; icon: React.ElementType; label?: string; priority: number }> = {
    'guild leader': { color: 'yellow', icon: FaCrown, priority: 1 },
    'vice leader': { color: 'cyan', icon: FaStar, priority: 2 },
    'admin': { color: 'purple', icon: FaShieldAlt, priority: 3 },
    'moderator': { color: 'orange', icon: FaFire, label: 'Halftime', priority: 4 },
    'apprentice': { color: 'blue', icon: BsPeopleFill, priority: 5 },
    'members': { color: 'gray', icon: BsPeopleFill, priority: 6 },
    'member': { color: 'gray', icon: BsPeopleFill, priority: 6 },
};

const CUSTOM_COLORS = ['pink', 'teal', 'green', 'red', 'indigo', 'purple', 'cyan', 'blue'];
function hashColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    return CUSTOM_COLORS[Math.abs(hash) % CUSTOM_COLORS.length];
}

function PositionBadge({ position }: { position: string }) {
    const roles = position.split(',').map(r => r.trim()).filter(Boolean);

    roles.sort((a, b) => {
        const pa = POSITION_COLORS[a.toLowerCase()]?.priority ?? 99;
        const pb = POSITION_COLORS[b.toLowerCase()]?.priority ?? 99;
        if (pa !== pb) return pa - pb;
        return a.localeCompare(b);
    });

    return (
        <div className="flex flex-wrap gap-1">
            {roles.map((role, i) => {
                const known = POSITION_COLORS[role.toLowerCase()];
                const colorCode = known?.color ?? hashColor(role);
                const colorDef = TAILWIND_COLORS[colorCode] || TAILWIND_COLORS['gray'];
                const Icon = known?.icon ?? BsFillTrophyFill;
                const label = known?.label ?? role;

                return (
                    <span
                        key={i}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colorDef.bg} ${colorDef.text} ${colorDef.border}`}
                    >
                        <Icon size={10} />
                        {label}
                    </span>
                );
            })}
        </div>
    );
}

// ─── Formatting & Export ────────────────────────────────────────────────────────

type SortField = 'nickname' | 'level' | 'week_activity_point' | 'last_week_activity' | 'total_activity' | 'week_fund' | 'total_fund';
type SortDir = 'asc' | 'desc' | null;

function fmt(n: number | undefined | null): string {
    if (n == null) return '0';
    return n.toLocaleString('vi-VN');
}

function exportCSV(members: ClubMemberSnapshot[], weekId: string) {
    const headers = ['Nickname', 'Level', 'Chức vụ', 'Điểm Tuần', 'Tuần Trước', 'Quỹ Tuần', 'Tổng Cống Hiến', 'Tổng Quỹ'];
    const rows = members.map(m => [
        m.nickname, m.level, m.position,
        m.week_activity_point, m.last_week_activity,
        m.week_fund, m.total_activity, m.total_fund,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `club-activity-${weekId || 'latest'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Components ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, bgClass, textClass }: any) {
    return (
        <div className="flex flex-col p-5 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${bgClass} opacity-10 pointer-events-none transition-transform group-hover:scale-150 duration-500`} />
            <div className="flex items-center gap-4 relative z-10 w-full">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass} ${textClass}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">{label}</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white truncate">{value}</p>
                </div>
            </div>
        </div>
    );
}

function SortHeader({ label, field, sortField, sortDir, onSort, isNumeric }: {
    label: string;
    field: SortField;
    sortField: SortField | null;
    sortDir: SortDir;
    onSort: (field: SortField) => void;
    isNumeric?: boolean;
}) {
    const isActive = sortField === field;
    return (
        <th
            className={`py-4 px-6 text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors uppercase ${isNumeric ? 'text-right' : 'text-left'}`}
            onClick={() => onSort(field)}
        >
            <div className={`flex items-center ${isNumeric ? 'justify-end' : 'justify-start'}`}>
                {label}
                <span className={`ml-1 inline-block ${isActive ? 'opacity-100 text-indigo-500 mx-0.5' : 'opacity-30'}`}>
                    {isActive ? (sortDir === 'asc' ? <FaSortUp className="mt-1" /> : <FaSortDown className="mb-1" />) : <FaSort />}
                </span>
            </div>
        </th>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

const ClubActivityPage: NextPageWithLayout = () => {
    const guild = useRouter().query.guild as string;
    const configQuery = useClubConfigQuery(guild);
    const snapshotsQuery = useClubSnapshotsQuery(guild);

    const [selectedWeek, setSelectedWeek] = useState<string | undefined>(undefined);
    const snapshotQuery = useClubSnapshotQuery(guild, selectedWeek);

    const fetchMutation = useForceClubFetchMutation();

    // ── State ──
    const [search, setSearch] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [filterActivity, setFilterActivity] = useState('');
    const [sortField, setSortField] = useState<SortField | null>('week_activity_point');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(1);

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    const snapshot = snapshotQuery.data;
    const allMembers = snapshot?.members ?? [];

    // ── Filtering ──
    const filtered = useMemo(() => {
        let result = [...allMembers];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(m =>
                m.nickname?.toLowerCase().includes(q)
            );
        }

        if (filterPosition) {
            result = result.filter(m => m.position?.toLowerCase().includes(filterPosition.toLowerCase()));
        }

        if (filterActivity === 'low') {
            result = result.filter(m => m.week_activity_point < 1000);
        } else if (filterActivity === 'high') {
            result = result.filter(m => m.week_activity_point >= 1000);
        }

        return result;
    }, [allMembers, search, filterPosition, filterActivity]);

    // ── Sorting ──
    const sorted = useMemo(() => {
        if (!sortField || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = a[sortField] ?? 0;
            const bVal = b[sortField] ?? 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
    }, [filtered, sortField, sortDir]);

    // ── Pagination ──
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    useMemo(() => setPage(1), [search, filterPosition, filterActivity]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortField(null); setSortDir(null); }
            else setSortDir('asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const handleFetch = async () => {
        try {
            await fetchMutation.mutateAsync({ guild });
            toast.success('Đã cập nhật dữ liệu!');
        } catch {
            toast.error('Lỗi khi tải dữ liệu');
        }
    };

    // ── Stats ──
    const lowCount = allMembers.filter(m => m.week_activity_point < 1000).length;
    const avgActivity = allMembers.length > 0
        ? Math.round(allMembers.reduce((sum, m) => sum + m.week_activity_point, 0) / allMembers.length)
        : 0;
    const maxActivity = Math.max(...allMembers.map(m => m.week_activity_point), 1);

    if (!guild) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    // Not linked state
    if (configQuery.data && !configQuery.data.clubName) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-5 py-20 min-h-[60vh]">
                <BsExclamationTriangleFill size={48} className="text-orange-400 opacity-40" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Chưa Liên Kết Bang Hội</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-[400px]">
                    Dùng lệnh <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 font-mono text-xs border border-purple-200 dark:border-purple-500/20">/guild-setup link</span> trong Discord để gắn bang hội cho server này.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full flex-col flex gap-0 text-zinc-900 dark:text-zinc-50 antialiased selection:bg-indigo-500/30">
            {/* ─── HEADER / HERO ─── */}
            <div className="border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-transparent z-20">
                <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                            <span className="text-[10px] font-semibold tracking-wider text-indigo-700 dark:text-indigo-300 uppercase">Snapshot Data</span>
                        </div>
                        <h1 className="flex flex-col gap-1 text-3xl md:text-4xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
                            <span>Thống kê điểm danh</span>
                            <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 dark:from-yellow-400 dark:to-orange-500">
                                Cống Hiến Tuần
                            </span>
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                            Xem lịch sử cống hiến, điểm năng động hàng tuần của tất cả thành viên trong Bang hội.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <select
                            className="px-4 py-2 rounded-xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-sm focus:outline-none focus:border-indigo-400 text-zinc-900 dark:text-white font-medium cursor-pointer"
                            value={selectedWeek || ''}
                            onChange={e => setSelectedWeek(e.target.value || undefined)}
                        >
                            <option value="" className="text-zinc-500">Mới nhất (Tuần Hiện Tại)</option>
                            {(snapshotsQuery.data || []).map(w => (
                                <option key={w.weekId} value={w.weekId} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
                                    Dữ liệu Tuần {w.weekId.split('-W')[1]}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button onClick={() => exportCSV(sorted, snapshot?.weekId || 'latest')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm text-zinc-700 dark:text-zinc-300 transition-colors duration-150">
                                <BsDownload size={14} /> Xuất CSV
                            </button>
                            <button onClick={handleFetch} disabled={fetchMutation.isLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700 shadow-sm transition-colors duration-150 disabled:opacity-50">
                                <FaSync size={12} className={fetchMutation.isLoading ? 'animate-spin' : ''} />
                                {fetchMutation.isLoading ? 'Đang tải...' : 'Fetch mới'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 flex flex-col gap-8">
                {/* Stat Cards */}
                {!snapshotQuery.isLoading && !snapshotQuery.isError && snapshot && (
                    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <motion.div variants={fadeInUp}><StatCard icon={BsPeopleFill} label="Thành viên" value={snapshot.memberCount} bgClass="bg-blue-50 dark:bg-blue-500/10" textClass="text-blue-600 dark:text-blue-400" /></motion.div>
                        <motion.div variants={fadeInUp}><StatCard icon={BsLightningChargeFill} label="TB Điểm/Tuần" value={fmt(avgActivity)} bgClass="bg-purple-50 dark:bg-purple-500/10" textClass="text-purple-600 dark:text-purple-400" /></motion.div>
                        <motion.div variants={fadeInUp}><StatCard icon={FaFire} label="Liveness Bang" value={fmt(snapshot.clubLiveness)} bgClass="bg-orange-50 dark:bg-orange-500/10" textClass="text-orange-600 dark:text-orange-400" /></motion.div>
                        <motion.div variants={fadeInUp}><StatCard icon={BsExclamationTriangleFill} label="Dưới 1000 điểm" value={`${lowCount} người (${((lowCount / (snapshot.memberCount || 1)) * 100).toFixed(0)}%)`} bgClass="bg-red-50 dark:bg-red-500/10" textClass="text-red-600 dark:text-red-400" /></motion.div>
                    </motion.div>
                )}

                {/* Members Table */}
                <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    {/* Panel Header */}
                    <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10">
                                <BsFillTrophyFill size={16} />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                    Cống Hiến {snapshot?.clubName || configQuery.data?.clubName || 'Bang Hội'}
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    {snapshot?.weekId ? `Tuần ${snapshot.weekId.split('-W')[1]}` : 'Chưa có dữ liệu'}
                                    <span className="mx-2 opacity-50">•</span>
                                    {snapshot?.fetchedAt ? new Date(snapshot.fetchedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10">
                                {filtered.length} / {allMembers.length} hiển thị
                            </span>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-zinc-50/30 dark:bg-white/[0.01]">
                        <div className="relative w-full md:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                <BsSearch size={14} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/40 text-sm focus:outline-none focus:border-indigo-400 focus:shadow-sm dark:focus:border-cyan-500/50 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                                placeholder="Tìm kiếm tên..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-1">
                            <BsFunnel className="text-zinc-400 shrink-0" size={14} />
                            <select
                                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/40 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400 focus:shadow-sm w-full max-w-[170px] cursor-pointer"
                                value={filterPosition}
                                onChange={e => setFilterPosition(e.target.value)}
                            >
                                <option value="" className="text-zinc-500">Tất cả chức vụ</option>
                                {POSITION_OPTIONS.filter(o => o.value).map(o => (
                                    <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200">{o.label}</option>
                                ))}
                            </select>

                            <select
                                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/40 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400 focus:shadow-sm w-full max-w-[150px] cursor-pointer"
                                value={filterActivity}
                                onChange={e => setFilterActivity(e.target.value)}
                            >
                                {ACTIVITY_FILTER_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200">{o.label}</option>
                                ))}
                            </select>

                            {(search || filterPosition || filterActivity) && (
                                <button
                                    onClick={() => { setSearch(''); setFilterPosition(''); setFilterActivity(''); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 ml-auto whitespace-nowrap transition-colors duration-150"
                                >
                                    ✕ Bỏ lọc
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto min-h-[400px]">
                        {snapshotQuery.isLoading ? (
                            <div className="h-full flex items-center justify-center py-20">
                                <span className="text-zinc-400 text-sm animate-pulse">Đang tải dữ liệu...</span>
                            </div>
                        ) : snapshotQuery.isError ? (
                            <div className="h-full flex items-center justify-center py-20 text-red-400 text-sm font-medium">Lỗi hệ thống</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-transparent">
                                        <th className="py-4 px-6 text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 w-[50px] text-center">#</th>
                                        <SortHeader label="Nickname" field="nickname" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                        <th className="py-4 px-6 text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Chức vụ</th>
                                        <SortHeader label="Lv" field="level" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <SortHeader label="Điểm Tuần" field="week_activity_point" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <th className="py-4 px-4 text-[11px] w-[90px]"></th>
                                        <SortHeader label="Tuần Trước" field="last_week_activity" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <SortHeader label="Quỹ Tuần" field="week_fund" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <SortHeader label="Tổng" field="total_activity" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                    </tr>
                                </thead>
                                <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                                    <AnimatePresence>
                                        {paged.map((m, idx) => {
                                            const rank = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                                            const isLow = m.week_activity_point < 1000;
                                            const progressPct = Math.min((m.week_activity_point / maxActivity) * 100, 100);

                                            return (
                                                <motion.tr variants={fadeInUp} layoutId={`club-${m.pid || idx}`} key={m.pid || idx} className={`border-b border-zinc-100 dark:border-white/5 transition-colors duration-150 ${isLow ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.03]'}`}>
                                                    <td className="py-3 px-6 text-center">
                                                        <span className={`text-[13px] font-bold ${rank <= 3 ? ['text-yellow-500', 'text-zinc-400', 'text-amber-600'][rank - 1] : 'text-zinc-400 dark:text-zinc-500'}`}>
                                                            {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <span className={`text-[14px] ${isLow ? 'font-bold text-red-600 dark:text-red-400' : 'font-semibold text-zinc-900 dark:text-white'}`}>
                                                            {m.nickname}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6"><PositionBadge position={m.position} /></td>
                                                    <td className="py-3 px-6 text-right">
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400 border border-zinc-200 dark:border-white/10">
                                                            {m.level}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <span className={`text-[14px] font-black ${isLow ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                                            {fmt(m.week_activity_point)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-[70px] h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden" title={`${fmt(m.week_activity_point)} / ${fmt(maxActivity)}`}>
                                                            <div
                                                                className={`h-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${progressPct}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-right text-sm text-zinc-500 dark:text-zinc-400">{fmt(m.last_week_activity)}</td>
                                                    <td className="py-3 px-6 text-right text-sm font-bold text-amber-500 dark:text-amber-400">{fmt(m.week_fund)}</td>
                                                    <td className="py-3 px-6 text-right text-sm font-semibold text-zinc-700 dark:text-zinc-300">{fmt(m.total_activity)}</td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                    {paged.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4 text-zinc-400">
                                                    <BsPeopleFill size={32} className="opacity-30" />
                                                    <span className="text-sm font-medium">
                                                        {search || filterPosition || filterActivity ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có dữ liệu snapshot nào.'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </motion.tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Trang {page} / {totalPages} — Hiển thị {paged.length} dòng</span>
                            <div className="flex items-center gap-1.5">
                                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150">
                                    ← Trước
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = page - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors duration-150 ${page === pageNum ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150">
                                    Sau →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

ClubActivityPage.getLayout = (c: any) => getGuildLayout({ children: c, back: true });
export default ClubActivityPage;
