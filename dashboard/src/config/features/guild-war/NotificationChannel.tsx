import { FormControl, FormHelperText, Select } from '@chakra-ui/react';
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
            iconColor="var(--chakra-colors-blue-400)"
            title="Kênh Thông Báo"
            description="Kênh Discord để bot gửi poll báo danh hàng tuần"
        >
            <FormControl>
                <FieldLabel required>Kênh Đăng Ký Poll</FieldLabel>
                <Controller
                    name="channelId"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} placeholder="Chọn một kênh..." rounded="xl" isDisabled={channels.isLoading}>
                            {channels.data?.filter(c => c.type === 0).map(c => (
                                <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                        </Select>
                    )}
                />
                <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                    Bot gửi poll vào kênh này mỗi Thứ Sáu.
                </FormHelperText>
            </FormControl>
        </SectionCard>
    );
}
