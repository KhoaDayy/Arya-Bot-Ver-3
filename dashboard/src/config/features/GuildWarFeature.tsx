import { CustomFeatures } from '@/config/types';
import { UseFormRender } from '@/config/types';
import {
    Badge,
    Box,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputRightAddon,
    Select,
    SimpleGrid,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
    Wrap,
} from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { useGuildChannelsQuery, useGuildRolesQuery } from '@/api/hooks';
import { useRouter } from 'next/router';
import { BsHash, BsShieldFill, BsClock, BsBellFill } from 'react-icons/bs';
import { MdLockClock } from 'react-icons/md';
import { useState } from 'react';

// ─── Reusable Section Card ────────────────────────────────────────────────────
function SectionCard({
    icon,
    iconColor,
    title,
    description,
    children,
}: {
    icon: React.ElementType;
    iconColor: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <Box
            rounded="2xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _light={{ borderColor: 'blackAlpha.100', bg: 'white' }}
            bg="navy.800"
            overflow="hidden"
        >
            <Flex
                align="center"
                gap={3}
                px={5}
                py={4}
                borderBottom="1px solid"
                borderColor="whiteAlpha.100"
                _light={{ borderColor: 'blackAlpha.100', bg: 'gray.50' }}
                bg="whiteAlpha.50"
            >
                <Flex
                    w="36px"
                    h="36px"
                    rounded="lg"
                    bg={`${iconColor}20`}
                    align="center"
                    justify="center"
                    flexShrink={0}
                >
                    <Icon as={icon} w={4} h={4} color={iconColor} />
                </Flex>
                <Box>
                    <Text fontWeight="700" fontSize="sm" lineHeight="shorter">{title}</Text>
                    <Text fontSize="xs" color="TextSecondary">{description}</Text>
                </Box>
            </Flex>
            <Box px={5} py={5}>
                {children}
            </Box>
        </Box>
    );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <FormLabel mb={1} fontSize="sm" fontWeight="600" display="flex" alignItems="center" gap={2}>
            {children}
            {required && (
                <Badge colorScheme="red" fontSize="2xs" px={1.5} py={0.5} rounded="full">bắt buộc</Badge>
            )}
        </FormLabel>
    );
}

// ─── Reminder Offsets Input ───────────────────────────────────────────────────
function ReminderOffsetInput({
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

// ─── Main Feature Form ────────────────────────────────────────────────────────
export const useGuildWarFeature: UseFormRender<CustomFeatures['guiwar']> = (data, submit) => {
    const router = useRouter();
    const guildId = router.query.guild as string;
    const channels = useGuildChannelsQuery(guildId);
    const roles = useGuildRolesQuery(guildId);

    const form = useForm<CustomFeatures['guiwar']>({
        values: data,
        defaultValues: {
            ...data,
            reminderOffsets: data?.reminderOffsets ?? [30, 15, 5],
            signupDeadline: data?.signupDeadline ?? '20:00',
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        return submit(JSON.stringify(values));
    });

    return {
        onSubmit,
        canSave: form.formState.isDirty,
        reset() {
            form.reset(data);
        },
        component: (
            <Flex direction="column" gap={5} w="full" id="guiwar-form">

                {/* ── Section 1: Poll Channel ── */}
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
                            control={form.control}
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

                {/* ── Section 2: Roles ── */}
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
                                control={form.control}
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
                                control={form.control}
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

                {/* ── Section 3: Timings ── */}
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
                                control={form.control}
                                render={({ field }) => (
                                    <Input {...field} type="time" rounded="xl" />
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
                                control={form.control}
                                render={({ field }) => (
                                    <Input {...field} type="time" rounded="xl" />
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
                                control={form.control}
                                render={({ field }) => (
                                    <Input {...field} type="time" rounded="xl" />
                                )}
                            />
                            <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                                Nhắc nhở đi đánh Chủ Nhật.
                            </FormHelperText>
                        </FormControl>
                    </SimpleGrid>
                </SectionCard>

                {/* ── Section 4: Reminders ── */}
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
                            control={form.control}
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

                {/* ── Section 5: Signup Deadline ── */}
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
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="time"
                                        rounded="xl"
                                    />
                                )}
                            />
                            <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                                Mặc định 20:00. Bot tự disable nút và gửi thông báo khi đến giờ.
                            </FormHelperText>
                        </FormControl>
                    </SimpleGrid>
                </SectionCard>

                {/* ── Section 6: Voice Channel ── */}
                <SectionCard
                    icon={BsClock} // reusing an icon or maybe import a new one later
                    iconColor="var(--chakra-colors-teal-400)"
                    title="Tạo Voice Channel Chat"
                    description="Tự động tạo phòng voice vào đúng thời điểm chuông nhắc nhở đầu tiên kêu."
                >
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <FormControl>
                            <FieldLabel>Danh mục (Category) tạo kênh</FieldLabel>
                            <Controller
                                name="voiceCategory"
                                control={form.control}
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
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="VD: Guild War"
                                        rounded="xl"
                                    />
                                )}
                            />
                            <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                                Mặc định: Guild War
                            </FormHelperText>
                        </FormControl>
                    </SimpleGrid>
                </SectionCard>

            </Flex>
        ),
    };
};
