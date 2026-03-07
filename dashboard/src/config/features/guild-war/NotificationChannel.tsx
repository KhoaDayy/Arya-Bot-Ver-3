import { Controller, Control } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel, SectionCard } from './SharedComponents';
import { BsHash } from 'react-icons/bs';
import { GuildChannel } from '@/api/bot';

interface Props {
    control: Control<CustomFeatures['guiwar']>;
    channels: { data?: GuildChannel[]; isLoading: boolean };
}

export function NotificationChannel({ control, channels }: Props) {
    return (
        <SectionCard
            icon={BsHash}
            iconColor="blue"
            title="Kênh Thông Báo"
            description="Kênh Discord để bot gửi poll báo danh hàng tuần"
        >
            <div>
                <FieldLabel required>Kênh Đăng Ký Poll</FieldLabel>
                <Controller
                    name="channelId"
                    control={control}
                    render={({ field }) => (
                        <select
                            {...field}
                            disabled={channels.isLoading}
                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Chọn một kênh...</option>
                            {channels.data?.filter(c => c.type === 0).map(c => (
                                <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                        </select>
                    )}
                />
                <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                    Bot gửi poll vào kênh này mỗi Thứ Sáu.
                </p>
            </div>
        </SectionCard>
    );
}
