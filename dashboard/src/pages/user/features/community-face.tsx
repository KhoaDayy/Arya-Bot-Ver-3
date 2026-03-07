import { useState, useEffect, useCallback } from 'react';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaHeart, FaCopy, FaCheck, FaUsers, FaImage, FaSpinner } from 'react-icons/fa';
import { CustomNavbar } from '@/components/layout/navbar/custom';

interface FacePreset {
    id: string;
    name: string;
    msg: string;
    heat_val: number;
    like_num: number;
    hostnum: number;
    picture_url: string;
    plan_id: string;
    view_data: string;
    createdAt: string;
}

interface ApiResponse {
    page: number;
    total: number;
    totalPages: number;
    data: FacePreset[];
}

function buildPresetCode(preset: FacePreset): string {
    try {
        const viewData = typeof preset.view_data === 'string'
            ? JSON.parse(preset.view_data)
            : preset.view_data;
        let code = viewData?.face_data || '';
        const extra: any = {};
        if (viewData?.face_skeleton_data) extra.face_skeleton_data = viewData.face_skeleton_data;
        if (viewData?.face_makeup_data) extra.face_makeup_data = viewData.face_makeup_data;
        if (Object.keys(extra).length > 0) code += ' ' + JSON.stringify(extra);
        return code;
    } catch {
        return '';
    }
}

function PresetCard({ preset }: { preset: FacePreset }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const code = buildPresetCode(preset);
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white dark:bg-[#111] border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-200"
        >
            {/* Image */}
            <div className="relative aspect-square w-full bg-zinc-100 dark:bg-black overflow-hidden">
                {preset.picture_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={`https://wsrv.nl/?url=${encodeURIComponent(preset.picture_url)}`}
                        alt={preset.name}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                        <FaImage size={32} />
                    </div>
                )}
                {/* Stats overlay */}
                <div className="absolute top-2 left-2 flex gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-semibold">
                        <FaFire className="text-orange-400" />
                        {new Intl.NumberFormat().format(preset.heat_val || 0)}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-semibold">
                        <FaHeart className="text-pink-400" />
                        {new Intl.NumberFormat().format(preset.like_num || 0)}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-black text-zinc-900 dark:text-white text-sm truncate mb-1">
                    {preset.name || 'Unknown Preset'}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs italic truncate mb-3">
                    {preset.msg || 'Không có mô tả'}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                        HOST #{preset.hostnum}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                            bg-zinc-100 hover:bg-zinc-900 hover:text-white
                            dark:bg-white/5 dark:hover:bg-white dark:hover:text-black
                            text-zinc-700 dark:text-zinc-300 transition-all duration-150"
                    >
                        {copied
                            ? <><FaCheck className="text-green-500" /> Copied</>
                            : <><FaCopy /> Copy Code</>
                        }
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

const CommunityFace: NextPageWithLayout = () => {
    const [presets, setPresets] = useState<FacePreset[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [bodyType, setBodyType] = useState(''); // '' = all, '0' = nam, '1' = nu

    const fetchPresets = useCallback(async (pageNum: number, currentSort: string, currentBodyType: string) => {
        setLoading(true);
        setError('');
        try {
            let url = `/api/features/community-faces?page=${pageNum}&limit=12&sortBy=${currentSort}`;
            if (currentBodyType !== '') url += `&bodyType=${currentBodyType}`;

            const res = await fetch(url);
            const json: ApiResponse = await res.json();
            if (!res.ok) throw new Error((json as any).message || 'Lỗi tải dữ liệu');
            setPresets(prev => pageNum === 1 ? json.data : [...prev, ...json.data]);
            setPage(json.page);
            setTotalPages(json.totalPages);
            setTotal(json.total);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPresets(1, 'newest', ''); }, [fetchPresets]);

    const loadMore = () => { if (page < totalPages) fetchPresets(page + 1, sortBy, bodyType); };

    return (
        <div className="w-full max-w-6xl mx-auto py-8">
            {/* Page Header */}
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                    bg-pink-50 text-pink-500 dark:bg-pink-500/10 dark:text-pink-400 mb-6
                    drop-shadow-sm border border-pink-100 dark:border-pink-500/20">
                    <FaUsers size={24} />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
                    Community Face
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Kho Preset khuôn mặt đã được convert bởi cộng đồng. Tìm và copy ngay mã Preset bạn yêu thích.
                </p>
                {total > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
                        bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10
                        text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        {total.toLocaleString()} presets trong kho
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row items-center justify-center gap-4 mb-10">
                <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => { setSortBy('newest'); fetchPresets(1, 'newest', bodyType); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'newest' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    >
                        Mới nhất
                    </button>
                    <button
                        onClick={() => { setSortBy('hottest'); fetchPresets(1, 'hottest', bodyType); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'hottest' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    >
                        Độ Hot <FaFire className="inline pb-0.5 text-orange-400" />
                    </button>
                    <button
                        onClick={() => { setSortBy('liked'); fetchPresets(1, 'liked', bodyType); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'liked' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    >
                        Yêu thích <FaHeart className="inline pb-0.5 text-pink-400" />
                    </button>
                </div>
                <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => { setBodyType(''); fetchPresets(1, sortBy, ''); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${bodyType === '' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    >
                        Tất cả giới tính
                    </button>
                    <button
                        onClick={() => { setBodyType('1'); fetchPresets(1, sortBy, '1'); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${bodyType === '1' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    >
                        Nam
                    </button>
                    <button
                        onClick={() => { setBodyType('0'); fetchPresets(1, sortBy, '0'); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${bodyType === '0' ? 'bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    >
                        Nữ
                    </button>
                </div>
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="max-w-2xl mx-auto mb-8 p-4 rounded-xl border border-red-200 bg-red-50
                            text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 text-center font-medium"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid */}
            {presets.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                    {presets.map((p, i) => (
                        <PresetCard key={`${p.id}-${i}`} preset={p} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && presets.length === 0 && !error && (
                <div className="text-center text-zinc-400 dark:text-zinc-600 font-mono text-sm tracking-widest uppercase mt-20">
                    Chưa có preset nào trong kho...
                </div>
            )}

            {/* Load More + Spinner */}
            <div className="flex flex-col items-center gap-4">
                {loading && (
                    <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-sm">
                        <FaSpinner className="animate-spin" />
                        Đang tải...
                    </div>
                )}
                {!loading && page < totalPages && (
                    <button
                        onClick={loadMore}
                        className="px-8 py-3 rounded-full font-bold border border-zinc-300 dark:border-white/10
                            bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-300
                            hover:bg-zinc-900 hover:text-white hover:border-transparent
                            dark:hover:bg-white dark:hover:text-black
                            transition-all duration-200 text-sm"
                    >
                        Tải thêm ({page}/{totalPages})
                    </button>
                )}
                {!loading && page >= totalPages && presets.length > 0 && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-widest">
                        — Đã hiển thị hết {total} presets —
                    </p>
                )}
            </div>
        </div>
    );
};

CommunityFace.getLayout = (c) => (
    <AppLayout navbar={<CustomNavbar name="Community Face" icon={<FaUsers className="text-pink-500" />} />}>
        {c}
    </AppLayout>
);
export default CommunityFace;
