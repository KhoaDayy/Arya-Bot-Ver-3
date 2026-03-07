import { Controller, Control } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel, SectionCard } from './SharedComponents';
import { BsClock } from 'react-icons/bs';

interface Props {
    control: Control<CustomFeatures['guiwar']>;
}

export function ScheduleConfig({ control }: Props) {
    return (
        <SectionCard
            icon={BsClock}
            iconColor="orange"
            title="Lịch Thông Báo"
            description="Thời gian bot gửi poll và ping đi đánh"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <FieldLabel required>Gửi POLL (Thứ 6)</FieldLabel>
                    <Controller
                        name="pollTime"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="time"
                                className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                            />
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                        Bot gửi poll vào Thứ 6 hàng tuần.
                    </p>
                </div>

                <div>
                    <FieldLabel>Thời gian bắt đầu Thứ 7</FieldLabel>
                    <Controller
                        name="timeT7"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="time"
                                className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                            />
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                        Nhắc nhở đi đánh Thứ 7.
                    </p>
                </div>

                <div>
                    <FieldLabel>Thời gian bắt đầu Chủ Nhật</FieldLabel>
                    <Controller
                        name="timeCN"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="time"
                                className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                            />
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                        Nhắc nhở đi đánh Chủ Nhật.
                    </p>
                </div>
            </div>
        </SectionCard>
    );
}
