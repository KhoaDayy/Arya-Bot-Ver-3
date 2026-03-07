import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
    BsPeopleFill, BsCalendarCheck, BsSearch, BsDownload, BsFunnel,
    BsLightningChargeFill
} from 'react-icons/bs';
import { FaEdit, FaTrash, FaSortUp, FaSortDown, FaSort, FaRobot } from 'react-icons/fa';
import { FiExternalLink, FiSettings } from 'react-icons/fi';
import { useGwMembersQuery, useUpdateGwMemberMutation, useDeleteGwMemberMutation } from '@/api/hooks';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ──────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const ROLE_OPTIONS = [
    '', 'DPS - Quạt dù công', 'DPS - Vô danh', 'DPS - Song đao', 'DPS - Cửu kiếm',
    'Flex / 3 chỉ', 'Tank', 'Healer'
];

const LANE_OPTIONS = [
    '', 'Top (Đường Trên)', 'Jungle (Đi Rừng)', 'Mid (Đường Giữa)', 'Bot (Đường Dưới)'
];

type SortField = 'username' | 'ingameName' | 'role' | 'lane';
type SortDir = 'asc' | 'desc' | null;

// ─── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, colorClass, bgClass, textClass }: any) {
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

// ─── Charts ─────────────────────────────────────────────────────────────────────

function RoleStatsPanel({ members }: { members: any[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const tooltipBg = isDark ? '#1E1E2D' : 'white';
    const tooltipBorder = isDark ? '#2d2d3d' : '#E2E8F0';
    const tooltipText = isDark ? '#F7FAFC' : '#1A202C';

    const getCount = (keyword: string) => members.filter(m => m.role?.toLowerCase().includes(keyword)).length;

    const data = [
        { name: 'Quạt dù công', value: getCount('quạt'), color: '#f87171' }, // red-400
        { name: 'Vô danh', value: getCount('vô danh'), color: '#fb923c' }, // orange-400
        { name: 'Song đao', value: getCount('song đao'), color: '#fbbf24' }, // amber-400
        { name: 'Cửu kiếm', value: getCount('cửu kiếm'), color: '#ef4444' }, // red-500
        { name: 'Flex / 3 chỉ', value: getCount('flex') + getCount('3 chỉ'), color: '#a78bfa' }, // purple-400
        { name: 'Tank', value: getCount('tank'), color: '#38bdf8' }, // sky-400
        { name: 'Healer', value: getCount('healer'), color: '#4ade80' }, // green-400
    ].filter(d => d.value > 0);

    return (
        <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col h-full">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Thống Kê Vai Trò (Role)</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Tổng hợp cố định</p>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center relative min-h-[260px]">
                {data.length === 0 ? (
                    <p className="text-sm text-zinc-500">Chưa có dữ liệu</p>
                ) : (
                    <>
                        <div className="absolute inset-0 w-full h-[200px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                                        {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-auto pt-[210px] flex flex-wrap justify-center gap-3">
                            {data.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function LaneStatsPanel({ members }: { members: any[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const tooltipBg = isDark ? '#1E1E2D' : 'white';
    const tooltipBorder = isDark ? '#2d2d3d' : '#E2E8F0';
    const tooltipText = isDark ? '#F7FAFC' : '#1A202C';
    const axisColor = isDark ? '#718096' : '#A0AEC0';
    const cursorFill = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const getCount = (laneValue: string) => members.filter(m => m.lane === laneValue).length;
    const data = [
        { name: 'Top', full: 'Top (Đường Trên)', value: getCount('Top (Đường Trên)'), color: '#38bdf8' },
        { name: 'Jungle', full: 'Jungle (Đi Rừng)', value: getCount('Jungle (Đi Rừng)'), color: '#4ade80' },
        { name: 'Mid', full: 'Mid (Đường Giữa)', value: getCount('Mid (Đường Giữa)'), color: '#f472b6' },
        { name: 'Bot', full: 'Bot (Đường Dưới)', value: getCount('Bot (Đường Dưới)'), color: '#a78bfa' },
    ];

    return (
        <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col h-full">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Thống Kê Vị Trí (Lane)</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Tổng hợp cố định</p>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center relative min-h-[260px]">
                {members.length === 0 ? (
                    <p className="text-sm text-zinc-500">Chưa có dữ liệu</p>
                ) : (
                    <>
                        <div className="absolute inset-0 w-full h-[200px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: cursorFill }}
                                        contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                        itemStyle={{ color: tooltipText }}
                                        formatter={(value: any, _name: any, props: any) => [value + ' người', props.payload.full]}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                        {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-auto pt-[210px] flex flex-wrap justify-center gap-4">
                            {data.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Modal Implementation ───────────────────────────────────────────────────────

function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: any) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${sizeClasses[size as keyof typeof sizeClasses]} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-white/[0.02]">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 border-t border-zinc-100 dark:border-white/5 flex justify-end gap-3 bg-zinc-50 dark:bg-white/[0.02]">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Edit Member Modal ──────────────────────────────────────────────────────────

function EditMemberModal({ isOpen, onClose, member, guildId }: {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    guildId: string;
}) {
    const mutation = useUpdateGwMemberMutation();
    const [ingameName, setIngameName] = useState('');
    const [role, setRole] = useState('');
    const [lane, setLane] = useState('');

    // Sync state when member changes
    const handleOpen = useCallback(() => {
        if (member) {
            setIngameName(member.ingameName || '');
            setRole(member.role || '');
            setLane(member.lane || '');
        }
    }, [member]);

    if (isOpen && member) {
        if (ingameName !== (member.ingameName || '') && !mutation.isLoading && ingameName === '') {
            handleOpen();
        }
    }

    const handleSave = async () => {
        try {
            await mutation.mutateAsync({
                guild: guildId,
                userId: member.userId,
                data: { ingameName, role, lane }
            });
            onClose();
            // Reset local state after success
            setIngameName('');
        } catch {
            console.error('Update failed');
        }
    };

    const handleCancel = () => {
        setIngameName('');
        onClose();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title={`Chỉnh sửa — ${member?.username}`}
            footer={
                <>
                    <button onClick={handleCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                        Hủy
                    </button>
                    <button onClick={handleSave} disabled={mutation.isLoading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {mutation.isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tên Ingame</label>
                    <input
                        value={ingameName}
                        onChange={e => setIngameName(e.target.value)}
                        placeholder="Nhập tên trong game"
                        className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-sm focus:outline-none focus:border-indigo-400 text-zinc-900 dark:text-white"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Vai trò (Role)</label>
                    <input
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        placeholder="VD: DPS - Cửu kiếm"
                        className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-sm focus:outline-none focus:border-indigo-400 text-zinc-900 dark:text-white"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Vị trí (Lane)</label>
                    <select
                        value={lane}
                        onChange={e => setLane(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-sm focus:outline-none focus:border-indigo-400 text-zinc-900 dark:text-white appearance-none"
                    >
                        {LANE_OPTIONS.map(l => (
                            <option key={l} value={l} className="bg-white dark:bg-zinc-800">{l || '-- Chưa chọn --'}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Modal>
    );
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────────────

function DeleteMemberModal({ isOpen, onClose, member, guildId }: {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    guildId: string;
}) {
    const mutation = useDeleteGwMemberMutation();

    const handleDelete = async () => {
        try {
            await mutation.mutateAsync({ guild: guildId, userId: member.userId });
            onClose();
        } catch {
            console.error('Delete failed');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận xoá"
            size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                        Hủy
                    </button>
                    <button onClick={handleDelete} disabled={mutation.isLoading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
                        {mutation.isLoading ? 'Đang xoá...' : 'Xác nhận xoá'}
                    </button>
                </>
            }
        >
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Bạn có chắc muốn xoá <strong className="text-zinc-900 dark:text-white">{member?.username}</strong> ({member?.ingameName || 'N/A'}) khỏi hệ thống?
            </p>
            <p className="text-xs text-red-500/80 dark:text-red-400/80 mt-3 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">
                Thao tác này không thể hoàn tác. Thành viên sẽ được tự động thêm lại nếu họ đăng ký lại ở Discord.
            </p>
        </Modal>
    );
}

// ─── CSV Export ──────────────────────────────────────────────────────────────────

function exportCSV(members: any[]) {
    const headers = ['Discord User', 'User ID', 'Tên Ingame', 'Vai Trò', 'Vị Trí (Lane)'];
    const rows = members.map(m => [
        m.username,
        m.userId,
        m.ingameName || '',
        m.role || '',
        m.lane || '',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guild-war-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Role Badge Component ───────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
    if (!role) return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400 border border-zinc-200 dark:border-white/10">N/A</span>;

    const r = role.toLowerCase();
    let colorClass = "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:border-white/20";

    if (r.includes('quạt') || r.includes('vô danh') || r.includes('song đao') || r.includes('cửu kiếm') || r.includes('dps')) {
        colorClass = "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    } else if (r.includes('healer')) {
        colorClass = "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
    } else if (r.includes('tank')) {
        colorClass = "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
    } else if (r.includes('flex') || r.includes('3 chỉ')) {
        colorClass = "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
            {role}
        </span>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

const GwMembersPage: NextPageWithLayout = () => {
    const guild = useRouter().query.guild as string;
    const query = useGwMembersQuery(guild);
    const members = query.data ?? [];

    // ── State ──
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterLane, setFilterLane] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [page, setPage] = useState(1);

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    // Custom Modal State
    const [editMember, setEditMember] = useState<any>(null);
    const [deleteMember, setDeleteMember] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // ── Filtering ──
    const filtered = useMemo(() => {
        let result = [...members];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(m =>
                m.username?.toLowerCase().includes(q) ||
                m.ingameName?.toLowerCase().includes(q) ||
                m.userId?.toLowerCase().includes(q)
            );
        }

        if (filterRole) {
            result = result.filter(m => m.role?.toLowerCase().includes(filterRole.toLowerCase()));
        }

        if (filterLane) {
            result = result.filter(m => m.lane === filterLane);
        }

        return result;
    }, [members, search, filterRole, filterLane]);

    // ── Sorting ──
    const sorted = useMemo(() => {
        if (!sortField || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = (a[sortField] || '').toLowerCase();
            const bVal = (b[sortField] || '').toLowerCase();
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortField, sortDir]);

    // ── Pagination ──
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Reset page when filters change
    useMemo(() => setPage(1), [search, filterRole, filterLane]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortField(null); setSortDir(null); }
            else setSortDir('asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const handleEdit = (member: any) => {
        setEditMember(member);
        setIsEditOpen(true);
    };

    const handleDelete = (member: any) => {
        setDeleteMember(member);
        setIsDeleteOpen(true);
    };

    // ── Stats ──
    const topLane = useMemo(() => {
        const lanes = ['Top (Đường Trên)', 'Jungle (Đi Rừng)', 'Mid (Đường Giữa)', 'Bot (Đường Dưới)'];
        let max = 0, name = 'N/A';
        lanes.forEach(l => {
            const count = members.filter(m => m.lane === l).length;
            if (count > max) { max = count; name = l.split(' (')[0]; }
        });
        return max > 0 ? `${name} (${max})` : 'N/A';
    }, [members]);

    const topRole = useMemo(() => {
        const roles = ['quạt', 'vô danh', 'song đao', 'cửu kiếm', 'flex', 'tank', 'healer'];
        const labels: Record<string, string> = { 'quạt': 'Quạt', 'vô danh': 'Vô danh', 'song đao': 'Song đao', 'cửu kiếm': 'Cửu kiếm', 'flex': 'Flex', 'tank': 'Tank', 'healer': 'Healer' };
        let max = 0, name = 'N/A';
        roles.forEach(r => {
            const count = members.filter(m => m.role?.toLowerCase().includes(r)).length;
            if (count > max) { max = count; name = labels[r]; }
        });
        return max > 0 ? `${name} (${max})` : 'N/A';
    }, [members]);

    const SortIcon = ({ field }: { field: SortField }) => {
        const isActive = sortField === field;
        if (!isActive) return <FaSort className="opacity-30 inline-block ml-1 mb-0.5" />;
        return sortDir === 'asc' ? <FaSortUp className="text-indigo-500 inline-block ml-1 mt-1" /> : <FaSortDown className="text-indigo-500 inline-block ml-1 mb-1" />;
    };

    if (!guild) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
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
                            <span className="text-[10px] font-semibold tracking-wider text-indigo-700 dark:text-indigo-300 uppercase">Database Connected</span>
                        </div>
                        <h1 className="flex flex-col gap-1 text-3xl md:text-4xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
                            <span>Quản lý hồ sơ</span>
                            <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-500 dark:from-cyan-400 dark:to-indigo-400">
                                Thành Viên Guild War
                            </span>
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                            Toàn quyền kiểm soát và phân công vị trí cho thành viên. Dữ liệu này được lưu vĩnh viễn cho đến khi bị xóa.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => exportCSV(sorted)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm text-zinc-700 dark:text-zinc-300 transition-colors duration-150">
                            <BsDownload size={14} /> Xuất CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 flex flex-col gap-8">
                {/* Stat Cards */}
                {!query.isLoading && !query.isError && (
                    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <motion.div variants={fadeInUp}><StatCard icon={BsPeopleFill} label="Tổng thành viên" value={members.length} bgClass="bg-blue-50 dark:bg-blue-500/10" textClass="text-blue-600 dark:text-blue-400" /></motion.div>
                        <motion.div variants={fadeInUp}><StatCard icon={BsCalendarCheck} label="Đã xếp Lane" value={members.filter(m => m.lane).length} bgClass="bg-green-50 dark:bg-green-500/10" textClass="text-green-600 dark:text-green-400" /></motion.div>
                        <motion.div variants={fadeInUp}><StatCard icon={FaRobot} label="Lane ưu chuộng" value={topLane} bgClass="bg-orange-50 dark:bg-orange-500/10" textClass="text-orange-600 dark:text-orange-400" /></motion.div>
                        <motion.div variants={fadeInUp}><StatCard icon={BsLightningChargeFill} label="Role sát thủ" value={topRole} bgClass="bg-purple-50 dark:bg-purple-500/10" textClass="text-purple-600 dark:text-purple-400" /></motion.div>
                    </motion.div>
                )}

                {/* Charts */}
                {!query.isLoading && !query.isError && members.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        <LaneStatsPanel members={members} />
                        <RoleStatsPanel members={members} />
                    </div>
                )}

                {/* Members Table */}
                <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    {/* Panel Header */}
                    <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10">
                                <BsPeopleFill size={16} />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Danh Sách Thành Viên</h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Hiện có {filtered.length} người / tổng số {members.length}</p>
                            </div>
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
                                placeholder="Tìm kiếm tên discord, ingame, ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-1">
                            <BsFunnel className="text-zinc-400 shrink-0" size={14} />
                            <select
                                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/40 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400 focus:shadow-sm w-full max-w-[160px] cursor-pointer"
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value)}
                            >
                                <option value="" className="text-zinc-500">Tất cả Role</option>
                                {ROLE_OPTIONS.filter(Boolean).map(r => (
                                    <option key={r} value={r} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200">{r}</option>
                                ))}
                            </select>

                            <select
                                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/40 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400 focus:shadow-sm w-full max-w-[170px] cursor-pointer"
                                value={filterLane}
                                onChange={e => setFilterLane(e.target.value)}
                            >
                                <option value="" className="text-zinc-500">Tất cả Lane</option>
                                {LANE_OPTIONS.filter(Boolean).map(r => (
                                    <option key={r} value={r} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200">{r}</option>
                                ))}
                            </select>

                            {(search || filterRole || filterLane) && (
                                <button
                                    onClick={() => { setSearch(''); setFilterRole(''); setFilterLane(''); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 ml-auto whitespace-nowrap transition-colors duration-150"
                                >
                                    ✕ Bỏ lọc
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto min-h-[400px]">
                        {query.isLoading ? (
                            <div className="h-full flex items-center justify-center py-20">
                                <span className="text-zinc-400 text-sm animate-pulse">Đang tải dữ liệu...</span>
                            </div>
                        ) : query.isError ? (
                            <div className="h-full flex items-center justify-center py-20 text-red-400 text-sm font-medium">Lỗi hệ thống</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-transparent uppercase">
                                        <th className="py-4 px-6 text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors" onClick={() => handleSort('username')}>
                                            <div className="flex items-center">Discord User <SortIcon field="username" /></div>
                                        </th>
                                        <th className="py-4 px-6 text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors" onClick={() => handleSort('ingameName')}>
                                            <div className="flex items-center">Ingame & Vai trò <SortIcon field="ingameName" /></div>
                                        </th>
                                        <th className="py-4 px-6 text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors" onClick={() => handleSort('lane')}>
                                            <div className="flex items-center">Vị trí (Lane) <SortIcon field="lane" /></div>
                                        </th>
                                        <th className="py-4 px-6 text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 w-32 text-center">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                                    <AnimatePresence>
                                        {paged.map((item, idx) => (
                                            <motion.tr variants={fadeInUp} layoutId={`gw-${item.userId}`} key={item.userId} className="border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{item.username}</span>
                                                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 rounded text-[10px] font-mono tracking-widest">{item.userId}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1.5 items-start">
                                                        <span className="text-[14px] font-bold text-zinc-900 dark:text-white">
                                                            {item.ingameName || <span className="text-zinc-400 italic font-normal text-xs">Chưa có tên</span>}
                                                        </span>
                                                        <RoleBadge role={item.role} />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {item.lane ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30">
                                                            {item.lane}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 border border-zinc-200 dark:border-white/10 dark:text-zinc-500 border-dashed">
                                                            -- Trống --
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center gap-1.5">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(item)} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-lg transition-colors duration-150" title="Chỉnh sửa">
                                                            <FaEdit size={14} />
                                                        </motion.button>
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors duration-150" title="Xoá">
                                                            <FaTrash size={14} />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {paged.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4 text-zinc-400">
                                                    <BsCalendarCheck size={32} className="opacity-30" />
                                                    <span className="text-sm font-medium">{(search || filterRole || filterLane) ? 'Không tìm thấy kết quả lọc.' : 'Chưa có thành viên nào được thêm.'}</span>
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

            {/* Modals placed outside main container */}
            <EditMemberModal
                isOpen={isEditOpen}
                onClose={() => { setIsEditOpen(false); setEditMember(null); }}
                member={editMember}
                guildId={guild}
            />
            <DeleteMemberModal
                isOpen={isDeleteOpen}
                onClose={() => { setIsDeleteOpen(false); setDeleteMember(null); }}
                member={deleteMember}
                guildId={guild}
            />
        </div>
    );
};

GwMembersPage.getLayout = (c: any) => getGuildLayout({ back: true, children: c });
export default GwMembersPage;
