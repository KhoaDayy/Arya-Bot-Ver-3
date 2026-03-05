import { FormControl, FormHelperText, Input, SimpleGrid } from '@chakra-ui/react';
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
            iconColor="var(--chakra-colors-red-400)"
            title="Deadline Đăng Ký"
            description="Sau giờ này vào Chủ Nhật, bot sẽ tự đóng nút đăng ký"
        >
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                    <FieldLabel>Đóng đăng ký lúc (Chủ Nhật)</FieldLabel>
                    <Controller
                        name="signupDeadline"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="time"
                                rounded="xl"
                                variant="main"
                            />
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Mặc định 20:00. Bot tự disable nút và gửi thông báo khi đến giờ.
                    </FormHelperText>
                </FormControl>
            </SimpleGrid>
        </SectionCard>
    );
}
