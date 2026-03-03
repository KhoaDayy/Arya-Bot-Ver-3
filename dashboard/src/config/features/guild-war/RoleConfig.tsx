import { FormControl, FormHelperText, Select, SimpleGrid } from '@chakra-ui/react';
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
            iconColor="var(--chakra-colors-purple-400)"
            title="Role Tham Chiến"
            description="Role sẽ được gán cho thành viên báo danh tham gia Guild War"
        >
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                    <FieldLabel>Role Thứ 7</FieldLabel>
                    <Controller
                        name="roleT7"
                        control={control}
                        render={({ field }) => (
                            <Select {...field} placeholder="Tự động tạo: [GW] Thứ 7" rounded="xl" isDisabled={roles.isLoading}>
                                {roles.data?.map(r => (
                                    <option key={r.id} value={r.id}>@{r.name}</option>
                                ))}
                            </Select>
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">Để trống = bot tự tạo.</FormHelperText>
                </FormControl>

                <FormControl>
                    <FieldLabel>Role Chủ Nhật</FieldLabel>
                    <Controller
                        name="roleCN"
                        control={control}
                        render={({ field }) => (
                            <Select {...field} placeholder="Tự động tạo: [GW] Chủ Nhật" rounded="xl" isDisabled={roles.isLoading}>
                                {roles.data?.map(r => (
                                    <option key={r.id} value={r.id}>@{r.name}</option>
                                ))}
                            </Select>
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">Để trống = bot tự tạo.</FormHelperText>
                </FormControl>
            </SimpleGrid>
        </SectionCard>
    );
}
