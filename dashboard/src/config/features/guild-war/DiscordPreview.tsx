import { Box, Flex, HStack, Image, Text, Button as ChakraButton, Avatar, Badge as ChakraBadge } from '@chakra-ui/react';
import { useState } from 'react';

const BOT_AVATAR_URL = 'https://cdn.discordapp.com/avatars/1468604087015575840/6665997965b49b30636b086bb80dfc58.png?size=128';
const BOT_NAME = 'Arya';

const DEFAULT_BANNER = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3564740/6d94b048393d5358690a04a7db99f2c9739c703c/header.jpg?t=1763157550';
const DEFAULT_POLL_TITLE = 'Báo Danh Guild War';
const DEFAULT_PING = '## 🚨 ĐẾN GIỜ WAR RỒI ANH EM!\n### Thứ 7 (Saturday)\n@[GW] Thứ 7\n> Vui lòng online vào game **ngay bây giờ**, tập kết và Join Voice!\n> Chúc party đánh war thành công rực rỡ! 💪';
const DEFAULT_REMINDER = '## ⏰ Còn 30 phút — Guild War Thứ 7!\n@[GW] Thứ 7 Chuẩn bị vào game và Join Voice nhé!';

type PreviewTab = 'poll' | 'ping' | 'reminder';

function renderTemplate(template: string, vars: Record<string, string> = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

function DiscordMarkdown({ text }: { text: string }) {
    const lines = text.split(/\\n|\n/);

    const renderInline = (str: string) => {
        // Bold
        const parts = str.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        );
    };

    return (
        <Flex direction="column" gap={0.5}>
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith('## ')) {
                    return <Text key={i} fontWeight="800" fontSize="lg" lineHeight="short">{renderInline(trimmed.slice(3))}</Text>;
                }
                if (trimmed.startsWith('### ')) {
                    return <Text key={i} fontWeight="700" fontSize="md" lineHeight="short" mt={0.5}>{renderInline(trimmed.slice(4))}</Text>;
                }
                if (trimmed.startsWith('> ')) {
                    return (
                        <Box key={i} pl={3} borderLeft="3px solid" borderColor="whiteAlpha.300" my={0.5}>
                            <Text fontSize="sm" color="whiteAlpha.800">{renderInline(trimmed.slice(2))}</Text>
                        </Box>
                    );
                }
                if (trimmed.startsWith('-#')) {
                    return <Text key={i} fontSize="xs" color="whiteAlpha.500">{trimmed.replace(/^-# ?/, '')}</Text>;
                }
                // Role mentions
                if (trimmed.startsWith('@')) {
                    return (
                        <Text key={i} fontSize="sm">
                            <Box as="span" bg="rgba(88, 101, 242, 0.3)" color="#c9cdfb" px={1} rounded="sm" cursor="pointer">
                                {renderInline(trimmed)}
                            </Box>
                        </Text>
                    );
                }
                return <Text key={i} fontSize="sm">{renderInline(trimmed)}</Text>;
            })}
        </Flex>
    );
}

function DayBadge({ label, color }: { label: string; color: string }) {
    return (
        <Box
            display="inline-flex"
            alignItems="center"
            gap={1}
            bg={color}
            color="white"
            fontSize="2xs"
            fontWeight="700"
            px={1.5}
            py={0.5}
            rounded="sm"
            textTransform="uppercase"
            letterSpacing="wide"
        >
            {label}
        </Box>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DiscordPreview({ form }: { form: any }) {
    const [activeTab, setActiveTab] = useState<PreviewTab>('poll');
    const watched = form.watch();
    const c = watched.customization || {};

    const bannerUrl = c.bannerUrl || DEFAULT_BANNER;
    const pollTitle = c.pollTitle || DEFAULT_POLL_TITLE;
    const pollColor = c.accentColorPoll || '#5865F2';
    const pingColor = c.accentColorPing || '#E74C3C';
    const reminderColor = c.accentColorReminder || '#F39C12';
    const timeT7 = watched.timeT7 || '19:30';
    const timeCN = watched.timeCN || '19:30';

    const pingText = c.pingMessage
        ? renderTemplate(c.pingMessage, { mention: '@[GW] Thứ 7', day: 'Thứ 7 (Saturday)' })
        : DEFAULT_PING;

    const reminderText = c.reminderMessage
        ? renderTemplate(c.reminderMessage, { mention: '@[GW] Thứ 7', day: 'Thứ 7', minutes: '30' })
        : DEFAULT_REMINDER;

    const accent = activeTab === 'poll' ? pollColor : activeTab === 'ping' ? pingColor : reminderColor;

    // Fake timestamp
    const now = new Date();
    const fakeTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    return (
        <Box w="full">
            {/* Tab selector */}
            <HStack gap={1} mb={3}>
                {(['poll', 'ping', 'reminder'] as PreviewTab[]).map(tab => (
                    <ChakraButton
                        key={tab}
                        size="xs"
                        rounded="full"
                        variant={activeTab === tab ? 'solid' : 'ghost'}
                        colorScheme={activeTab === tab ? 'brand' : 'gray'}
                        onClick={() => setActiveTab(tab)}
                        fontWeight="600"
                    >
                        {tab === 'poll' ? '📋 Poll' : tab === 'ping' ? '🚨 Ping' : '⏰ Reminder'}
                    </ChakraButton>
                ))}
            </HStack>

            {/* Discord message container — always dark */}
            <Box
                bg="#313338"
                color="white"
                rounded="lg"
                overflow="hidden"
                border="1px solid"
                borderColor="#3f4147"
                px={4}
                py={3}
                _hover={{ bg: '#2e3035' }}
                transition="background 0.15s ease"
            >
                {/* Message header: avatar + bot name + badge + timestamp */}
                <Flex gap={3} align="flex-start">
                    {/* Bot avatar */}
                    <Avatar
                        src={BOT_AVATAR_URL}
                        name={BOT_NAME}
                        size="md"
                        mt={0.5}
                        flexShrink={0}
                    />

                    {/* Message content area */}
                    <Box flex={1} minW={0}>
                        {/* Bot name line */}
                        <Flex align="center" gap={1.5} mb={1}>
                            <Text fontWeight="700" fontSize="sm" color="#f2f3f5" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                                {BOT_NAME}
                            </Text>
                            <Box
                                bg="#5865F2"
                                color="white"
                                fontSize="2xs"
                                fontWeight="700"
                                px={1}
                                py={0}
                                rounded="sm"
                                lineHeight="shorter"
                                display="inline-flex"
                                alignItems="center"
                            >
                                APP
                            </Box>
                            <Text fontSize="xs" color="#949ba4">
                                {fakeTimestamp}
                            </Text>
                        </Flex>

                        {/* Embed */}
                        <Box
                            bg="#2b2d31"
                            rounded="md"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="#232428"
                            position="relative"
                            maxW="520px"
                        >
                            {/* Accent color bar */}
                            <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                w="4px"
                                bg={accent}
                                roundedLeft="md"
                            />

                            <Box pl={5} pr={4} py={3}>
                                {activeTab === 'poll' && (
                                    <Flex direction="column" gap={2}>
                                        {/* Banner */}
                                        <Image
                                            src={bannerUrl}
                                            alt="Banner"
                                            rounded="md"
                                            maxH="140px"
                                            w="full"
                                            objectFit="cover"
                                            fallback={<Box h="80px" bg="whiteAlpha.100" rounded="md" />}
                                        />
                                        {/* Title */}
                                        <Text fontWeight="800" fontSize="md" color="white" lineHeight="short">
                                            📢 {pollTitle} — Tuần 10
                                        </Text>
                                        {/* Schedule row */}
                                        <Flex align="center" gap={2} flexWrap="wrap" fontSize="sm" color="whiteAlpha.800">
                                            <DayBadge label="SAT" color="#5865F2" />
                                            <Text fontWeight="700">Thứ 7</Text>
                                            <Box
                                                as="code"
                                                bg="#1e1f22"
                                                px={1.5}
                                                py={0.5}
                                                rounded="sm"
                                                fontSize="xs"
                                                fontFamily="mono"
                                            >
                                                {timeT7}
                                            </Box>
                                            <Text mx={1} color="whiteAlpha.400">│</Text>
                                            <DayBadge label="SUN" color="#ED4245" />
                                            <Text fontWeight="700">Chủ Nhật</Text>
                                            <Box
                                                as="code"
                                                bg="#1e1f22"
                                                px={1.5}
                                                py={0.5}
                                                rounded="sm"
                                                fontSize="xs"
                                                fontFamily="mono"
                                            >
                                                {timeCN}
                                            </Box>
                                        </Flex>
                                        {/* Deadline */}
                                        {watched.signupDeadline && (
                                            <Text fontSize="xs" color="whiteAlpha.500">
                                                🔒 Đăng ký đóng lúc {watched.signupDeadline} Chủ Nhật
                                            </Text>
                                        )}
                                        <Box h="1px" bg="whiteAlpha.100" />
                                        {/* Stats row */}
                                        <Flex align="center" gap={2} flexWrap="wrap" fontSize="sm" color="whiteAlpha.800">
                                            <Text>👤 Đã báo danh:</Text>
                                            <DayBadge label="SAT" color="#5865F2" />
                                            <Text>T7 <strong>1</strong></Text>
                                            <DayBadge label="SUN" color="#ED4245" />
                                            <Text>CN <strong>1</strong></Text>
                                            <Text>⭐ Cả <strong>2</strong> 1</Text>
                                        </Flex>
                                        {/* Faux buttons */}
                                        <HStack gap={2} mt={1} flexWrap="wrap">
                                            <ChakraButton
                                                size="xs"
                                                rounded="md"
                                                fontWeight="600"
                                                bg="#5865F2"
                                                color="white"
                                                _hover={{ bg: '#4752C4' }}
                                                pointerEvents="none"
                                                leftIcon={<DayBadge label="SAT" color="#4752C4" />}
                                            >
                                                Thứ 7
                                            </ChakraButton>
                                            <ChakraButton
                                                size="xs"
                                                rounded="md"
                                                fontWeight="600"
                                                bg="#5865F2"
                                                color="white"
                                                _hover={{ bg: '#4752C4' }}
                                                pointerEvents="none"
                                                leftIcon={<DayBadge label="SUN" color="#4752C4" />}
                                            >
                                                Chủ Nhật
                                            </ChakraButton>
                                            <ChakraButton
                                                size="xs"
                                                rounded="md"
                                                fontWeight="600"
                                                bg="#248046"
                                                color="white"
                                                _hover={{ bg: '#1a6334' }}
                                                pointerEvents="none"
                                            >
                                                🌟 Cả 2 Ngày
                                            </ChakraButton>
                                            <ChakraButton
                                                size="xs"
                                                rounded="md"
                                                fontWeight="600"
                                                bg="#DA373C"
                                                color="white"
                                                _hover={{ bg: '#a12d31' }}
                                                pointerEvents="none"
                                            >
                                                ❌ Hủy
                                            </ChakraButton>
                                        </HStack>
                                    </Flex>
                                )}

                                {activeTab === 'ping' && (
                                    <Box color="white">
                                        <DiscordMarkdown text={pingText} />
                                    </Box>
                                )}

                                {activeTab === 'reminder' && (
                                    <Box color="white">
                                        <DiscordMarkdown text={reminderText} />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Flex>
            </Box>
            <Text fontSize="2xs" color="whiteAlpha.400" mt={1.5} fontStyle="italic">
                * Preview gần đúng — trên Discord sẽ khác chút.
            </Text>
        </Box>
    );
}
