import { FormControl, FormHelperText, Input, SimpleGrid } from '@chakra-ui/react';
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
            iconColor="var(--chakra-colors-orange-400)"
            title="Lịch Thông Báo"
            description="Thời gian bot gửi poll và ping đi đánh"
        >
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <FormControl>
                    <FieldLabel required>Gửi POLL (Thứ 6)</FieldLabel>
                    <Controller
                        name="pollTime"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} type="time" rounded="xl" variant="main" />
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Bot gửi poll vào Thứ 6 hàng tuần.
                    </FormHelperText>
                </FormControl>

                <FormControl>
                    <FieldLabel>Thời gian bắt đầu Thứ 7</FieldLabel>
                    <Controller
                        name="timeT7"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} type="time" rounded="xl" variant="main" />
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Nhắc nhở đi đánh Thứ 7.
                    </FormHelperText>
                </FormControl>

                <FormControl>
                    <FieldLabel>Thời gian bắt đầu Chủ Nhật</FieldLabel>
                    <Controller
                        name="timeCN"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} type="time" rounded="xl" variant="main" />
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Nhắc nhở đi đánh Chủ Nhật.
                    </FormHelperText>
                </FormControl>
            </SimpleGrid>
        </SectionCard>
    );
}
