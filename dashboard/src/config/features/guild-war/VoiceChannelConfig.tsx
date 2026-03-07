import { Controller, Control } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel, SectionCard } from './SharedComponents';
import { BsClock } from 'react-icons/bs';
import { GuildChannel } from '@/api/bot';

interface Props {
    control: Control<CustomFeatures['guiwar']>;
    channels: { data?: GuildChannel[]; isLoading: boolean };
}

export function VoiceChannelConfig({ control, channels }: Props) {
    return (
        <SectionCard
            icon={BsClock}
            iconColor="teal"
            title="Tạo Voice Channel Chat"
            description="Tự động tạo phòng voice vào đúng thời điểm chuông nhắc nhở đầu tiên kêu."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FieldLabel>Danh mục (Category) tạo kênh</FieldLabel>
                    <Controller
                        name="voiceCategory"
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                disabled={channels.isLoading}
                                className="w-full h-11 pl-4 pr-10 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Chọn danh mục...</option>
                                {channels.data?.filter(c => c.type === 4).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                        Nếu chọn, bot sẽ tự tạo kênh Voice tại Danh mục này.
                    </p>
                </div>

                <div>
                    <FieldLabel>Tên kênh Voice</FieldLabel>
                    <Controller
                        name="voiceNameTemplate"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                placeholder="VD: Guild War"
                                className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                        Mặc định: Guild War
                    </p>
                </div>
            </div>
        </SectionCard>
    );
}
