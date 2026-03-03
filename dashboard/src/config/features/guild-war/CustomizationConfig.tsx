import { Flex, FormControl, FormHelperText, Input, InputGroup, InputRightAddon, SimpleGrid, Textarea } from '@chakra-ui/react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { FieldLabel } from './SharedComponents';

interface Props {
    form: UseFormReturn<CustomFeatures['guiwar']>;
}

export function CustomizationConfig({ form }: Props) {
    const { control } = form;

    return (
        <Flex direction="column" gap={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                    <FieldLabel>Banner URL</FieldLabel>
                    <Controller
                        name="customization.bannerUrl"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} value={field.value ?? ''} placeholder="https://... (để trống = mặc định)" rounded="xl" variant="main" />
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Ảnh banner hiển thị trên đầu poll.
                    </FormHelperText>
                </FormControl>

                <FormControl>
                    <FieldLabel>Logo URL</FieldLabel>
                    <Controller
                        name="customization.logoUrl"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} value={field.value ?? ''} placeholder="https://... (để trống = mặc định)" rounded="xl" variant="main" />
                        )}
                    />
                    <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                        Logo nhỏ hiển thị khi poll kết thúc.
                    </FormHelperText>
                </FormControl>
            </SimpleGrid>

            <FormControl>
                <FieldLabel>Tiêu đề Poll</FieldLabel>
                <Controller
                    name="customization.pollTitle"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} value={field.value ?? ''} placeholder="Báo Danh Guild War" rounded="xl" variant="main" />
                    )}
                />
                <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                    Tên hiển thị trên tiêu đề poll. Để trống = &quot;Báo Danh Guild War&quot;
                </FormHelperText>
            </FormControl>

            <FormControl>
                <FieldLabel>Nội dung Ping War</FieldLabel>
                <Controller
                    name="customization.pingMessage"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            rounded="xl"
                            rows={5}
                            fontSize="sm"
                        />
                    )}
                />
                <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                    Biến hỗ trợ: {'{mention}'} = tag role, {'{day}'} = tên ngày. Dùng \n để xuống dòng.
                </FormHelperText>
            </FormControl>

            <FormControl>
                <FieldLabel>Nội dung Nhắc Nhở</FieldLabel>
                <Controller
                    name="customization.reminderMessage"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            rounded="xl"
                            rows={3}
                            fontSize="sm"
                        />
                    )}
                />
                <FormHelperText fontSize="xs" mt={2} color="TextSecondary">
                    Biến hỗ trợ: {'{mention}'} = tag role, {'{day}'} = tên ngày, {'{minutes}'} = số phút. Dùng \n để xuống dòng.
                </FormHelperText>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <FormControl>
                    <FieldLabel>Màu Poll</FieldLabel>
                    <Controller
                        name="customization.accentColorPoll"
                        control={control}
                        render={({ field }) => (
                            <InputGroup>
                                <InputRightAddon
                                    bg={field.value || '#5865F2'}
                                    w="40px"
                                    h="40px"
                                    rounded="xl"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    _light={{ borderColor: 'blackAlpha.200' }}
                                    cursor="pointer"
                                    p={0}
                                    overflow="hidden"
                                >
                                    <Input
                                        type="color"
                                        value={field.value || '#5865F2'}
                                        onChange={field.onChange}
                                        opacity={0}
                                        w="full"
                                        h="full"
                                        cursor="pointer"
                                        p={0}
                                        border="none"
                                    />
                                </InputRightAddon>
                                <Input {...field} placeholder="#5865F2" rounded="xl" variant="main" />
                            </InputGroup>
                        )}
                    />
                </FormControl>
                <FormControl>
                    <FieldLabel>Màu Ping</FieldLabel>
                    <Controller
                        name="customization.accentColorPing"
                        control={control}
                        render={({ field }) => (
                            <InputGroup>
                                <InputRightAddon
                                    bg={field.value || '#E74C3C'}
                                    w="40px"
                                    h="40px"
                                    rounded="xl"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    _light={{ borderColor: 'blackAlpha.200' }}
                                    cursor="pointer"
                                    p={0}
                                    overflow="hidden"
                                >
                                    <Input
                                        type="color"
                                        value={field.value || '#E74C3C'}
                                        onChange={field.onChange}
                                        opacity={0}
                                        w="full"
                                        h="full"
                                        cursor="pointer"
                                        p={0}
                                        border="none"
                                    />
                                </InputRightAddon>
                                <Input {...field} placeholder="#E74C3C" rounded="xl" variant="main" />
                            </InputGroup>
                        )}
                    />
                </FormControl>
                <FormControl>
                    <FieldLabel>Màu Nhắc Nhở</FieldLabel>
                    <Controller
                        name="customization.accentColorReminder"
                        control={control}
                        render={({ field }) => (
                            <InputGroup>
                                <InputRightAddon
                                    bg={field.value || '#F39C12'}
                                    w="40px"
                                    h="40px"
                                    rounded="xl"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    _light={{ borderColor: 'blackAlpha.200' }}
                                    cursor="pointer"
                                    p={0}
                                    overflow="hidden"
                                >
                                    <Input
                                        type="color"
                                        value={field.value || '#F39C12'}
                                        onChange={field.onChange}
                                        opacity={0}
                                        w="full"
                                        h="full"
                                        cursor="pointer"
                                        p={0}
                                        border="none"
                                    />
                                </InputRightAddon>
                                <Input {...field} placeholder="#F39C12" rounded="xl" variant="main" />
                            </InputGroup>
                        )}
                    />
                </FormControl>
            </SimpleGrid>
        </Flex>
    );
}
