import { FormControl, FormHelperText, Input, Select, SimpleGrid } from '@chakra-ui/react';
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
            iconColor="var(--chakra-colors-teal-400)"
            title="Tạo Voice Channel Chat"
            description="Tự động tạo phòng voice vào đúng thời điểm chuông nhắc nhở đầu tiên kêu."
        >
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                    <FieldLabel>Danh mục (Category) tạo kênh</FieldLabel>
                    <Controller
                        name="voiceCategory"
                        control={control}
                        render={({ field }) => (
                            <Select {...field} placeholder="Chọn danh mục..." rounded="xl" isDisabled={channels.isLoading}>
                                {channels.data?.filter(c => c.type === 4).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Nếu chọn, bot sẽ tự tạo kênh Voice tại Danh mục này.
                    </FormHelperText>
                </FormControl>

                <FormControl>
                    <FieldLabel>Tên kênh Voice</FieldLabel>
                    <Controller
                        name="voiceNameTemplate"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="VD: Guild War"
                                rounded="xl"
                                variant="main"
                            />
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Mặc định: Guild War
                    </FormHelperText>
                </FormControl>
            </SimpleGrid>
        </SectionCard>
    );
}
