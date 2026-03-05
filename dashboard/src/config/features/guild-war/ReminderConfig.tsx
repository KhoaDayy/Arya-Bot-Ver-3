import { Box, HStack, Input, InputGroup, InputRightAddon, Badge, Wrap, Tag, TagLabel, TagCloseButton, Text, FormControl, FormHelperText } from '@chakra-ui/react';
import { Controller, Control } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel, SectionCard } from './SharedComponents';
import { BsBellFill } from 'react-icons/bs';
import { useState } from 'react';

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
        <Box>
            <Wrap gap={2} mb={3} minH="32px">
                {(value ?? []).map(n => (
                    <Tag key={n} colorScheme="orange" rounded="full" size="md">
                        <TagLabel fontWeight="700">{n}p</TagLabel>
                        <TagCloseButton onClick={() => removeOffset(n)} />
                    </Tag>
                ))}
                {(value ?? []).length === 0 && (
                    <Text fontSize="xs" color="TextSecondary" my="auto">Chưa có reminder nào</Text>
                )}
            </Wrap>
            <HStack gap={2}>
                <InputGroup size="sm" maxW="140px">
                    <Input
                        type="number"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOffset())}
                        placeholder="VD: 30"
                        rounded="lg"
                        min={1}
                        max={120}
                        variant="main"
                    />
                    <InputRightAddon rounded="lg" px={2} fontSize="xs">phút</InputRightAddon>
                </InputGroup>
                <Badge
                    as="button"
                    type="button"
                    onClick={addOffset}
                    colorScheme="orange"
                    cursor="pointer"
                    px={3}
                    py={1.5}
                    rounded="lg"
                    fontSize="xs"
                    fontWeight="700"
                    _hover={{ opacity: 0.8 }}
                >
                    + Thêm
                </Badge>
            </HStack>
        </Box>
    );
}

export function ReminderConfig({ control }: Props) {
    return (
        <SectionCard
            icon={BsBellFill}
            iconColor="var(--chakra-colors-yellow-400)"
            title="Nhắc Nhở Trước Trận"
            description="Bot sẽ gửi thông báo nhắc nhở trước giờ war theo các mốc đã cài"
        >
            <FormControl>
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
                <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                    Mặc định: 30p, 15p, 5p trước giờ War. Tối đa 120 phút.
                </FormHelperText>
            </FormControl>
        </SectionCard>
    );
}
