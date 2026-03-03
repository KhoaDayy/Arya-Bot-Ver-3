import { Box, Flex, Icon, Text, Grid, GridItem } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import { CustomFeatures } from '@/config/types';
import { BsPaletteFill } from 'react-icons/bs';
import { CustomizationConfig } from './CustomizationConfig';
import { DiscordPreview } from './DiscordPreview';

interface Props {
    form: UseFormReturn<CustomFeatures['guiwar']>;
}

export function CustomizationPage({ form }: Props) {
    return (
        <Box
            rounded="2xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _light={{ borderColor: 'blackAlpha.100', bg: 'white' }}
            bg="navy.800"
            overflow="hidden"
        >
            {/* Header */}
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
                    bg="rgba(236, 72, 153, 0.12)"
                    align="center"
                    justify="center"
                    flexShrink={0}
                >
                    <Icon as={BsPaletteFill} w={4} h={4} color="var(--chakra-colors-pink-400)" />
                </Flex>
                <Box>
                    <Text fontWeight="700" fontSize="sm" lineHeight="shorter">Tuỳ Chỉnh Giao Diện</Text>
                    <Text fontSize="xs" color="TextSecondary">Thay đổi hình ảnh, màu sắc, và nội dung tin nhắn Guild War</Text>
                </Box>
            </Flex>

            {/* Split layout: Left = config, Right = preview */}
            <Grid
                templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                gap={0}
            >
                {/* Left: Customization form */}
                <GridItem
                    px={5}
                    py={5}
                    borderRight={{ base: 'none', lg: '1px solid' }}
                    borderBottom={{ base: '1px solid', lg: 'none' }}
                    borderColor="whiteAlpha.100"
                    _light={{ borderColor: 'blackAlpha.100' }}
                    color="TextPrimary"
                >
                    <CustomizationConfig form={form} />
                </GridItem>

                {/* Right: Discord preview (sticky) */}
                <GridItem
                    px={5}
                    py={5}
                    bg="whiteAlpha.25"
                    _light={{ bg: 'gray.50' }}
                >
                    <Box position="sticky" top="80px">
                        <Flex align="center" gap={2} mb={3}>
                            <Box w={2} h={2} rounded="full" bg="green.400" />
                            <Text fontWeight="700" fontSize="sm" color="TextPrimary">
                                Xem trước trên Discord
                            </Text>
                        </Flex>
                        <DiscordPreview form={form} />
                    </Box>
                </GridItem>
            </Grid>
        </Box>
    );
}
