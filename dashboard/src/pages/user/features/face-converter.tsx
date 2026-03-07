import { useState } from 'react';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImage, FaHeart, FaFireAlt, FaUser, FaCopy, FaCheck } from 'react-icons/fa';
import { BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';

const FaceConverter: NextPageWithLayout = () => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setError('');
        setData(null);
        setCopied(false);

        try {
            const res = await fetch(`/api/features/convert?id=${encodeURIComponent(keyword)}`);
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

    const handleCopy = () => {
        if (!data?.presetData) return;
        navigator.clipboard.writeText(data.presetData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderData = () => {
        if (!data) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-zinc-200/80 shadow-2xl bg-white dark:bg-[#111] dark:border-white/10"
            >
                <div className="flex flex-col md:flex-row h-full">
                    {/* Image Preview */}
                    <div className="w-full md:w-[400px] h-[300px] md:h-auto shrink-0 relative bg-zinc-100 dark:bg-black overflow-hidden border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/10">
                        {data.picture_url ? (
                            <img src={`https://wsrv.nl/?url=${encodeURIComponent(data.picture_url)}`} crossOrigin="anonymous" alt={data.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                                <FaImage size={40} />
                            </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white text-xs font-semibold">
                                <FaFireAlt className="text-orange-500" /> {new Intl.NumberFormat().format(data.heat_val)}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white text-xs font-semibold">
                                <FaHeart className="text-pink-500" /> {new Intl.NumberFormat().format(data.like_num)}
                            </div>
                        </div>
                    </div>

                    {/* Content info & Code */}
                    <div className="flex flex-col flex-1 min-w-0 p-6 md:p-8">
                        <div className="mb-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 leading-tight">
                                        {data.name}
                                    </h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic">
                                        "{data.msg}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 p-3 rounded-xl">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-1">Host ID</p>
                                <p className="text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
                                    <FaUser className="text-blue-500" /> {data.hostnum}
                                </p>
                            </div>
                            <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 p-3 rounded-xl">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-1">Plan ID</p>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                    {data.plan_id}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold tracking-widest uppercase text-zinc-900 dark:text-white">Preset Code (Converted)</p>
                                <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-zinc-200 transition-colors">
                                    {copied ? <><FaCheck className="text-green-500" /> Copied</> : <><FaCopy /> Copy Code</>}
                                </button>
                            </div>

                            <div className="relative group flex-1 min-h-[160px]">
                                <textarea
                                    readOnly
                                    value={data.presetData}
                                    className="w-full h-full p-4 rounded-xl font-mono text-xs leading-relaxed resize-none bg-zinc-50 border border-zinc-200 text-zinc-600 focus:outline-none dark:bg-black/50 dark:border-white/10 dark:text-zinc-300 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-white/20"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-50 to-transparent dark:from-black/80 pointer-events-none rounded-b-xl" />
                            </div>
                        </div>
                    </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 mb-6 drop-shadow-sm border border-blue-100 dark:border-blue-500/20">
                    <FaImage size={24} />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
                    Face Converter
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Chuyển đổi dữ liệu Face Preset từ WWM bản Trung (CN) sang tương thích Global. Paste URL hoặc ID Preset vào dưới đây.
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group mb-12">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                    <FaImage size={18} />
                </div>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={loading}
                    placeholder="Nhập ID Preset hoặc URL..."
                    className="block w-full pl-12 pr-32 py-4 rounded-full border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111] text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-0 transition-all font-medium disabled:opacity-50"
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
                        ) : 'CONVERT'}
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
                    Đang đợi nhập mã Preset...
                </div>
            )}
        </div>
    );
};

import { CustomNavbar } from '@/components/layout/navbar/custom';

FaceConverter.getLayout = (c) => <AppLayout navbar={<CustomNavbar name="Face Converter" icon={<FaImage className="text-blue-500" />} />}>{c}</AppLayout>;
export default FaceConverter;
