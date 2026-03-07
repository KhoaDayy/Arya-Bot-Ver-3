import { Controller, Control } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel, SectionCard } from './SharedComponents';
import { BsBellFill } from 'react-icons/bs';
import { MdClose } from 'react-icons/md';
import { useState, KeyboardEvent } from 'react';

interface Props {
    control: Control<CustomFeatures['guiwar']>;
}

export function ReminderOffsetInput({
    value,
    onChange,
}: {
    value: number[];
    onChange: (v: number[]) => void;
}) {
    const [inputVal, setInputVal] = useState('');

    const addOffset = () => {
        const num = parseInt(inputVal, 10);
        if (isNaN(num) || num <= 0 || num > 120) return;
        if (!value.includes(num)) {
            onChange([...value, num].sort((a, b) => b - a));
        }
        setInputVal('');
    };

    const removeOffset = (n: number) => {
        onChange(value.filter(x => x !== n));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[32px] items-center">
                {(value ?? []).length === 0 && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 my-auto">Chưa có reminder nào</span>
                )}
                {(value ?? []).map(n => (
                    <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 text-sm font-bold border border-orange-200 dark:border-orange-500/30">
                        {n}p
                        <button
                            type="button"
                            onClick={() => removeOffset(n)}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-500/40 text-orange-600 dark:text-orange-400 transition-colors"
                        >
                            <MdClose className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center relative max-w-[140px]">
                    <input
                        type="number"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addOffset())}
                        placeholder="VD: 30"
                        min={1}
                        max={120}
                        className="w-full h-10 pl-4 pr-12 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                    />
                    <span className="absolute right-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 pointer-events-none">
                        phút
                    </span>
                </div>

                <button
                    type="button"
                    onClick={addOffset}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-300 text-xs font-bold transition-colors border border-orange-200 dark:border-orange-500/30"
                >
                    + Thêm
                </button>
            </div>
        </div>
    );
}

export function ReminderConfig({ control }: Props) {
    return (
        <SectionCard
            icon={BsBellFill}
            iconColor="yellow"
            title="Nhắc Nhở Trước Trận"
            description="Bot sẽ gửi thông báo nhắc nhở trước giờ war theo các mốc đã cài"
        >
            <div>
                <FieldLabel>Các mốc nhắc nhở (phút trước war)</FieldLabel>
                <Controller
                    name="reminderOffsets"
                    control={control}
                    render={({ field }) => (
                        <ReminderOffsetInput
                            value={field.value ?? [30, 15, 5]}
                            onChange={field.onChange}
                        />
                    )}
                />
                <p className="text-xs mt-3 text-zinc-500 dark:text-zinc-400">
                    Mặc định: 30p, 15p, 5p trước giờ War. Tối đa 120 phút.
                </p>
            </div>
        </SectionCard>
    );
}
