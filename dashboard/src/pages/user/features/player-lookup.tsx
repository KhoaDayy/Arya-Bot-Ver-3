import { useState } from 'react';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUserNinja, FaClock, FaCalendar, FaHeartbeat } from 'react-icons/fa';
import { BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';

// Helper formatting functions mirroring bot's output
function formatOnlineTime(seconds: number) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (mins > 0) parts.push(`${mins} phút`);

    return parts.join(' ') || '0 phút';
}

function getBodyType(type: number) {
    switch (type) {
        case 0: return 'Nữ';
        case 1: return 'Nam';
    }
}

const SECT_INFO: Record<string, { label: string; color: string }> = {
    "1": { label: "Silver Needle", color: "#C0C0C0" },
    "2": { label: "The Masked Troupe", color: "#4169E1" },
    "4": { label: "Silver Needle", color: "#C0C0C0" },
    "6": { label: "Midnight Blades", color: "#8B4513" },
    "11": { label: "Nine Mortal Way", color: "#000000" },
    "12": { label: "Velvet Shade", color: "#FF69B4" },
    "Free": { label: "Vô Môn", color: "#708090" },
};

const PlayerLookup: NextPageWithLayout = () => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setError('');
        setData(null);

        try {
            const res = await fetch(`/api/features/lookup?keyword=${encodeURIComponent(keyword)}`);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Lỗi tra cứu');
            }

            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderData = () => {
        if (!data) return null;

        const isOnline = data.login_time > data.logout_time;
        const sectData = SECT_INFO[String(data.school)] || Object.values(SECT_INFO).find(s => s.label === data.school_name);
        const sectColor = sectData?.color || SECT_INFO['Free'].color;
        const sectLabel = sectData?.label || data.school_name || 'Vô Môn';
        const displayName = data.ly_stage_name ? `${data.nickname} (${data.ly_stage_name})` : data.nickname;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-zinc-200/80 shadow-2xl bg-white dark:bg-[#111] dark:border-white/10"
            >
                {/* Banner area */}
                <div className="relative h-48 md:h-64 w-full">
                    {data.cover_img ? (
                        <img src={`https://wsrv.nl/?url=${encodeURIComponent(data.cover_img)}`} crossOrigin="anonymous" alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-zinc-800 to-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {isOnline ? 'Đang Online' : 'Offline'}
                                </span>
                                {!isOnline && data.logout_time && (
                                    <span className="text-white/70 text-xs font-mono">
                                        Lần cuối: {new Date(data.logout_time * 1000).toLocaleString('vi-VN')}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">{displayName}</h2>
                            <p className="text-white/80 font-mono text-sm mt-1 flex items-center gap-2">
                                <span>UID: {data.number_id || 'N/A'}</span>
                                <span>•</span>
                                <span>Server: S{data.server_hostnum || '?'} ({data.oversea_tag})</span>
                            </p>
                        </div>

                        {data.level && (
                            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center min-w-[80px]">
                                <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Level</p>
                                <p className="text-2xl font-black text-white">{data.level}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Môn Phái</p>
                        <div className="flex items-center gap-2">
                            <div style={{ backgroundColor: sectColor }} className="w-2 h-2 rounded-full" />
                            <p className="font-semibold text-zinc-900 dark:text-white">{sectLabel}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Build Power</p>
                        <p className="font-semibold text-zinc-900 dark:text-white">{new Intl.NumberFormat().format(data.max_xiuwei_kungfu || 0)}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Cơ thể</p>
                        <p className="font-semibold text-zinc-900 dark:text-white">{getBodyType(data.body_type)}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Thời gian chơi</p>
                        <p className="font-semibold text-zinc-900 dark:text-white">{formatOnlineTime(data.online_time || 0)}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl p-4 md:col-span-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Ngày Sinh (In-game)</p>
                        <p className="font-semibold text-zinc-900 dark:text-white">
                            {data.create_time ? new Date(data.create_time * 1000).toLocaleString('vi-VN') : 'Không rõ'}
                        </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl p-4 md:col-span-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Bang Hội</p>
                        <p className="font-semibold text-zinc-900 dark:text-white">
                            {data._redis_player?.club?.club_name || 'Chưa gia nhập Bang'}
                        </p>
                    </div>

                    {(data.sign) && (
                        <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl p-4 md:col-span-4">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Chữ ký</p>
                            <p className="font-medium text-zinc-700 dark:text-zinc-300 italic">"{data.sign}"</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            {/* Header */}
            <Link href="/user/home" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium mb-8">
                <BsArrowLeft /> Quay lại Dashboard
            </Link>

            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 mb-6 drop-shadow-sm border border-purple-100 dark:border-purple-500/20">
                    <FaUserNinja size={24} />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
                    Player Lookup
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Truy vấn trực tiếp cơ sở dữ liệu của Where Winds Meet để tra cứu vũ khí, level, và thời gian online của bất kỳ người chơi nào.
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group mb-12">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-purple-500 transition-colors">
                    <FaSearch size={18} />
                </div>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={loading}
                    placeholder="Nhập tên nhân vật hoặc UID game..."
                    className="block w-full pl-12 pr-32 py-4 rounded-full border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111] text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 focus:ring-0 transition-all font-medium disabled:opacity-50"
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                    <button
                        type="submit"
                        disabled={loading || !keyword}
                        className="h-full px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            </div>
                        ) : 'TÌM KIẾM'}
                    </button>
                </div>
            </form>

            {/* Error Message */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="max-w-2xl mx-auto mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 text-center font-medium">
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {renderData()}

            {!data && !loading && !error && (
                <div className="text-center text-zinc-400 dark:text-zinc-600 font-mono text-sm tracking-widest uppercase mt-20">
                    Chờ lệnh truy vấn...
                </div>
            )}
        </div>
    );
};

import { CustomNavbar } from '@/components/layout/navbar/custom';

PlayerLookup.getLayout = (c) => <AppLayout navbar={<CustomNavbar name="Player Lookup" icon={<FaUserNinja className="text-purple-500" />} />}>{c}</AppLayout>;
export default PlayerLookup;
