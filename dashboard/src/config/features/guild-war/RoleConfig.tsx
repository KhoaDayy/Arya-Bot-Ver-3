import { Controller, Control } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel, SectionCard } from './SharedComponents';
import { BsShieldFill } from 'react-icons/bs';
import { Role } from '@/api/bot';

interface Props {
    control: Control<CustomFeatures['guiwar']>;
    roles: { data?: Role[]; isLoading: boolean };
}

export function RoleConfig({ control, roles }: Props) {
    return (
        <SectionCard
            icon={BsShieldFill}
            iconColor="purple"
            title="Role Tham Chiến"
            description="Role sẽ được gán cho thành viên báo danh tham gia Guild War"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FieldLabel>Role Thứ 7</FieldLabel>
                    <Controller
                        name="roleT7"
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                disabled={roles.isLoading}
                                className="w-full h-11 pl-4 pr-10 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Tự động tạo: [GW] Thứ 7</option>
                                {roles.data?.map(r => (
                                    <option key={r.id} value={r.id}>@{r.name}</option>
                                ))}
                            </select>
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">Để trống = bot tự tạo.</p>
                </div>

                <div>
                    <FieldLabel>Role Chủ Nhật</FieldLabel>
                    <Controller
                        name="roleCN"
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                disabled={roles.isLoading}
                                className="w-full h-11 pl-4 pr-10 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Tự động tạo: [GW] Chủ Nhật</option>
                                {roles.data?.map(r => (
                                    <option key={r.id} value={r.id}>@{r.name}</option>
                                ))}
                            </select>
                        )}
                    />
                    <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">Để trống = bot tự tạo.</p>
                </div>
            </div>
        </SectionCard>
    );
}
