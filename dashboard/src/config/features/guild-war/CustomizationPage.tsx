import { UseFormReturn } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { BsPaletteFill } from 'react-icons/bs';
import { CustomizationConfig } from './CustomizationConfig';
import { DiscordPreview } from './DiscordPreview';

interface Props {
    form: UseFormReturn<CustomFeatures['guiwar']>;
}

export function CustomizationPage({ form }: Props) {
    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-pink-100/50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                    <BsPaletteFill className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-0.5">Tuỳ Chỉnh Giao Diện</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Thay đổi hình ảnh, màu sắc, và nội dung tin nhắn Guild War</p>
                </div>
            </div>

            {/* Split layout: Left = config, Right = preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Customization form */}
                <div className="p-5 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100">
                    <CustomizationConfig form={form} />
                </div>

                {/* Right: Discord preview (sticky) */}
                <div className="p-5 bg-zinc-50/50 dark:bg-white/5 relative">
                    <div className="sticky top-20">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                                Xem trước trên Discord
                            </h4>
                        </div>
                        <DiscordPreview form={form} />
                    </div>
                </div>
            </div>
        </div>
    );
}
