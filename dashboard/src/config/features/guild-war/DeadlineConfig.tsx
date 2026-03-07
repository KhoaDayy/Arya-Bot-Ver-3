import { Controller, Control } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel, SectionCard } from './SharedComponents';
import { MdLockClock } from 'react-icons/md';

interface Props {
    control: Control<CustomFeatures['guiwar']>;
}

export function DeadlineConfig({ control }: Props) {
    return (
        <SectionCard
            icon={MdLockClock}
            iconColor="red"
            title="Deadline Đăng Ký"
            description="Sau giờ này vào Chủ Nhật, bot sẽ tự đóng nút đăng ký"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FieldLabel>Đóng đăng ký lúc (Chủ Nhật)</FieldLabel>
                    <Controller
                        name="signupDeadline"
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
                        Mặc định 20:00. Bot tự disable nút và gửi thông báo khi đến giờ.
                    </p>
                </div>
            </div>
        </SectionCard>
    );
}
