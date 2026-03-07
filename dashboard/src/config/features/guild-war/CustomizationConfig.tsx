import { Controller, UseFormReturn } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel } from './SharedComponents';

interface Props {
    form: UseFormReturn<CustomFeatures['guiwar']>;
}

export function CustomizationConfig({ form }: Props) {
    const { control } = form;

    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FieldLabel>Banner URL</FieldLabel>
                    <Controller
                        name="customization.bannerUrl"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                value={field.value ?? ''}
                                placeholder="https://... (để trống = mặc định)"
                                className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                            />
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                        Ảnh banner hiển thị trên đầu poll.
                    </p>
                </div>

                <div>
                    <FieldLabel>Logo URL</FieldLabel>
                    <Controller
                        name="customization.logoUrl"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                value={field.value ?? ''}
                                placeholder="https://... (để trống = mặc định)"
                                className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                            />
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                        Logo nhỏ hiển thị khi poll kết thúc.
                    </p>
                </div>
            </div>

            <div>
                <FieldLabel>Tiêu đề Poll</FieldLabel>
                <Controller
                    name="customization.pollTitle"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            value={field.value ?? ''}
                            placeholder="Báo Danh Guild War"
                            className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                        />
                    )}
                />
                <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                    Tên hiển thị trên tiêu đề poll. Để trống = &quot;Báo Danh Guild War&quot;
                </p>
            </div>

            <div>
                <FieldLabel>Nội dung Ping War</FieldLabel>
                <Controller
                    name="customization.pingMessage"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            rows={5}
                            className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all resize-none"
                        />
                    )}
                />
                <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                    Biến hỗ trợ: {'{mention}'} = tag role, {'{day}'} = tên ngày. Dùng \n để xuống dòng.
                </p>
            </div>

            <div>
                <FieldLabel>Nội dung Nhắc Nhở</FieldLabel>
                <Controller
                    name="customization.reminderMessage"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            rows={3}
                            className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all resize-none"
                        />
                    )}
                />
                <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                    Biến hỗ trợ: {'{mention}'} = tag role, {'{day}'} = tên ngày, {'{minutes}'} = số phút. Dùng \n để xuống dòng.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <FieldLabel>Màu Poll</FieldLabel>
                    <Controller
                        name="customization.accentColorPoll"
                        control={control}
                        render={({ field }) => (
                            <div className="flex w-full items-center p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus-within:bg-white dark:focus-within:bg-[#111] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                <div className="relative w-10 h-9 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/20 flex-shrink-0 cursor-pointer" style={{ backgroundColor: field.value || '#5865F2' }}>
                                    <input
                                        type="color"
                                        value={field.value || '#5865F2'}
                                        onChange={field.onChange}
                                        className="absolute -inset-4 w-20 h-20 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <input
                                    {...field}
                                    placeholder="#5865F2"
                                    className="flex-1 min-w-0 h-full px-3 bg-transparent border-none focus:ring-0 text-sm text-zinc-900 dark:text-white uppercase outline-none"
                                    value={field.value || ''}
                                />
                            </div>
                        )}
                    />
                </div>
                <div>
                    <FieldLabel>Màu Ping</FieldLabel>
                    <Controller
                        name="customization.accentColorPing"
                        control={control}
                        render={({ field }) => (
                            <div className="flex w-full items-center p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus-within:bg-white dark:focus-within:bg-[#111] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                <div className="relative w-10 h-9 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/20 flex-shrink-0 cursor-pointer" style={{ backgroundColor: field.value || '#E74C3C' }}>
                                    <input
                                        type="color"
                                        value={field.value || '#E74C3C'}
                                        onChange={field.onChange}
                                        className="absolute -inset-4 w-20 h-20 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <input
                                    {...field}
                                    placeholder="#E74C3C"
                                    className="flex-1 min-w-0 h-full px-3 bg-transparent border-none focus:ring-0 text-sm text-zinc-900 dark:text-white uppercase outline-none"
                                    value={field.value || ''}
                                />
                            </div>
                        )}
                    />
                </div>
                <div>
                    <FieldLabel>Màu Nhắc Nhở</FieldLabel>
                    <Controller
                        name="customization.accentColorReminder"
                        control={control}
                        render={({ field }) => (
                            <div className="flex w-full items-center p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus-within:bg-white dark:focus-within:bg-[#111] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                <div className="relative w-10 h-9 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/20 flex-shrink-0 cursor-pointer" style={{ backgroundColor: field.value || '#F39C12' }}>
                                    <input
                                        type="color"
                                        value={field.value || '#F39C12'}
                                        onChange={field.onChange}
                                        className="absolute -inset-4 w-20 h-20 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <input
                                    {...field}
                                    placeholder="#F39C12"
                                    className="flex-1 min-w-0 h-full px-3 bg-transparent border-none focus:ring-0 text-sm text-zinc-900 dark:text-white uppercase outline-none"
                                    value={field.value || ''}
                                />
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
