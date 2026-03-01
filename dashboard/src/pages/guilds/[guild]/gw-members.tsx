import {
    Box,
    Flex,
    Heading,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Spinner,
    Text,
    HStack,
    Icon,
    Select,
    useToast,
    useColorModeValue,
} from '@chakra-ui/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { BsPeopleFill, BsCalendarCheck } from 'react-icons/bs';
import { useGwMembersQuery, useUpdateGuildWarLaneMutation } from '@/api/hooks';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';

function LaneSelect({ guildId, userId, currentLane }: { guildId: string, userId: string, currentLane: string }) {
    const mutation = useUpdateGuildWarLaneMutation();
    const toast = useToast();

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            if (!userId) {
                toast({ title: 'Người dùng không có ID', status: 'error', isClosable: true });
                return;
            }
            await mutation.mutateAsync({ guild: guildId, userId, lane: e.target.value });
            toast({
                title: 'Đã lưu vị trí đi đường cho các tuần sau',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: 'Lưu thất bại',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Select
            size="xs"
            rounded="md"
            w="120px"
            value={currentLane || ''}
            onChange={handleChange}
            isDisabled={mutation.isLoading}
            bg={currentLane ? 'whiteAlpha.200' : 'transparent'}
            _focus={{ bg: 'PanelBoundary' }}
        >
            <option value="">-- Trống --</option>
            <option value="Top (Đường Trên)">Top (Đường Trên)</option>
            <option value="Jungle (Đi Rừng)">Jungle (Đi Rừng)</option>
            <option value="Mid (Đường Giữa)">Mid (Đường Giữa)</option>
            <option value="Bot (Đường Dưới)">Bot (Đường Dưới)</option>
        </Select>
    );
}

function RoleStatsPanel({ members }: { members: any[] }) {
    const tooltipBg = useColorModeValue('white', '#1E1E2D');
    const tooltipBorder = useColorModeValue('#E2E8F0', '#2d2d3d');
    const tooltipText = useColorModeValue('#1A202C', '#F7FAFC');

    const getCount = (keyword: string) => members.filter(m => m.role?.toLowerCase().includes(keyword)).length;

    const data = [
        { name: 'Quạt dù công', value: getCount('quạt'), color: '#FC8181' },
        { name: 'Vô danh', value: getCount('vô danh'), color: '#F6AD55' },
        { name: 'Song đao', value: getCount('song đao'), color: '#FBD38D' },
        { name: 'Cửu kiếm', value: getCount('cửu kiếm'), color: '#E53E3E' },
        { name: 'Flex / 3 chỉ', value: getCount('flex') + getCount('3 chỉ'), color: '#B794F4' },
        { name: 'Tank', value: getCount('tank'), color: '#63B3ED' },
        { name: 'Healer', value: getCount('healer'), color: '#68D391' },
    ].filter(d => d.value > 0);

    return (
        <Box
            rounded="2xl"
            overflow="hidden"
            shadow="md"
            bgColor="PanelBoundary"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _light={{ borderColor: 'blackAlpha.100' }}
        >
            <Flex
                align="center"
                px={5}
                py={4}
                borderBottom="1px solid"
                borderColor="whiteAlpha.100"
                _light={{ borderColor: 'blackAlpha.100' }}
            >
                <Box>
                    <Heading size="sm" fontWeight="700">Thống Kê Vai Trò (Role)</Heading>
                    <Text fontSize="xs" color="TextSecondary">Tổng hợp cố định</Text>
                </Box>
            </Flex>
            <Box p={4} h="250px" display="flex" alignItems="center" justifyContent="center">
                {data.length === 0 ? (
                    <Text color="TextSecondary" fontSize="sm">Chưa có dữ liệu</Text>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                itemStyle={{ color: tooltipText }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </Box>
            <Flex justify="center" gap={3} pb={4} flexWrap="wrap" px={3}>
                {data.map((entry, index) => (
                    <Flex align="center" gap={1.5} key={index}>
                        <Box w={2.5} h={2.5} rounded="full" bg={entry.color} />
                        <Text fontSize="xs" fontWeight="500">{entry.name} ({entry.value})</Text>
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
}

function LaneStatsPanel({ members }: { members: any[] }) {
    const tooltipBg = useColorModeValue('white', '#1E1E2D');
    const tooltipBorder = useColorModeValue('#E2E8F0', '#2d2d3d');
    const tooltipText = useColorModeValue('#1A202C', '#F7FAFC');
    const axisColor = useColorModeValue('#A0AEC0', '#718096');
    const cursorFill = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)');

    const getCount = (laneValue: string) => members.filter(m => m.lane === laneValue).length;

    const data = [
        { name: 'Top', full: 'Top (Đường Trên)', value: getCount('Top (Đường Trên)'), color: '#F6AD55' },
        { name: 'Jungle', full: 'Jungle (Đi Rừng)', value: getCount('Jungle (Đi Rừng)'), color: '#68D391' },
        { name: 'Mid', full: 'Mid (Đường Giữa)', value: getCount('Mid (Đường Giữa)'), color: '#63B3ED' },
        { name: 'Bot', full: 'Bot (Đường Dưới)', value: getCount('Bot (Đường Dưới)'), color: '#B794F4' },
    ];

    return (
        <Box
            rounded="2xl"
            overflow="hidden"
            shadow="md"
            bgColor="PanelBoundary"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _light={{ borderColor: 'blackAlpha.100' }}
        >
            <Flex
                align="center"
                px={5}
                py={4}
                borderBottom="1px solid"
                borderColor="whiteAlpha.100"
                _light={{ borderColor: 'blackAlpha.100' }}
            >
                <Box>
                    <Heading size="sm" fontWeight="700">Thống Kê Vị Trí (Lane)</Heading>
                    <Text fontSize="xs" color="TextSecondary">Tổng hợp cố định</Text>
                </Box>
            </Flex>
            <Box p={4} h="250px" display="flex" alignItems="center" justifyContent="center">
                {members.length === 0 ? (
                    <Text color="TextSecondary" fontSize="sm">Chưa có dữ liệu</Text>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                        >
                            <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: cursorFill }}
                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                itemStyle={{ color: tooltipText }}
                                formatter={(value: any, name: any, props: any) => [value + ' người', props.payload.full]}
                                labelStyle={{ display: 'none' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>
            <Flex justify="center" gap={4} pb={4} flexWrap="wrap">
                {data.map((entry, index) => (
                    <Flex align="center" gap={2} key={index}>
                        <Box w={3} h={3} rounded="sm" bg={entry.color} />
                        <Text fontSize="xs" fontWeight="500">{entry.name} ({entry.value})</Text>
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
}

const GwMembersPage: NextPageWithLayout = () => {
    const guild = useRouter().query.guild as string;
    const query = useGwMembersQuery(guild);

    const members = query.data ?? [];

    return (
        <Flex direction="column" gap={6}>
            {/* Charts */}
            {!query.isLoading && !query.isError && members.length > 0 && (
                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
                    <LaneStatsPanel members={members} />
                    <RoleStatsPanel members={members} />
                </SimpleGrid>
            )}

            {/* Members Table */}
            <Box
                rounded="2xl"
                overflow="hidden"
                shadow="md"
                bgColor="PanelBoundary"
                border="1px solid"
                borderColor="whiteAlpha.100"
                _light={{ borderColor: 'blackAlpha.100' }}
            >
                {/* Panel Header */}
                <Flex
                    align="center"
                    justify="space-between"
                    px={5}
                    py={4}
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.100"
                    _light={{ borderColor: 'blackAlpha.100' }}
                >
                    <HStack gap={3}>
                        <Flex
                            w="36px"
                            h="36px"
                            rounded="lg"
                            bg="rgba(59, 130, 246, 0.15)"
                            _dark={{ bg: 'rgba(96, 165, 250, 0.15)' }}
                            align="center"
                            justify="center"
                        >
                            <Icon as={BsPeopleFill} w={4} h={4} color="blue.400" />
                        </Flex>
                        <Box>
                            <Heading size="sm" fontWeight="700">Thành Viên Guild War</Heading>
                            <Text fontSize="xs" color="TextSecondary">Hồ sơ người chơi lưu vĩnh viễn</Text>
                        </Box>
                    </HStack>
                    {!query.isLoading && !query.isError && (
                        <Badge colorScheme="blue" rounded="full" px={3} py={1} fontSize="xs">
                            {members.length} người
                        </Badge>
                    )}
                </Flex>

                <Box p={4}>
                    {query.isLoading ? (
                        <Flex justify="center" py={8}>
                            <Spinner color="blue.400" />
                        </Flex>
                    ) : query.isError ? (
                        <Flex justify="center" py={8}>
                            <Text color="red.400" fontSize="sm">Lỗi lấy dữ liệu</Text>
                        </Flex>
                    ) : (
                        <Box overflowX="auto">
                            <Table variant="unstyled" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Discord User</Th>
                                        <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Ingame & Vai trò</Th>
                                        <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Vị trí (Lane cố định)</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {members.map((item, idx) => (
                                        <Tr
                                            key={idx}
                                            _hover={{ bgColor: 'whiteAlpha.50', _light: { bgColor: 'blackAlpha.50' } }}
                                            transition="background 0.15s ease"
                                            rounded="lg"
                                        >
                                            <Td py={2.5}>
                                                <Flex direction="column" gap={1}>
                                                    <Text fontSize="sm" fontWeight="600">{item.username}</Text>
                                                    <Badge colorScheme="purple" variant="subtle" px={2} py={0.1} rounded="md" fontSize="2xs" w="max-content">
                                                        {item.userId}
                                                    </Badge>
                                                </Flex>
                                            </Td>
                                            <Td py={2.5}>
                                                <Flex direction="column" gap={1}>
                                                    <Text fontSize="sm" fontWeight="600">{item.ingameName || <Text as="span" color="gray.500" fontStyle="italic">Chưa có</Text>}</Text>
                                                    <Badge w="fit-content" colorScheme={item.role?.includes('DPS') || item.role?.includes('Quạt') || item.role?.includes('Vô danh') || item.role?.includes('Song đao') || item.role?.includes('Cửu kiếm') ? 'red' : item.role?.includes('Healer') ? 'green' : item.role?.includes('Tank') ? 'blue' : item.role?.includes('Flex') ? 'purple' : 'gray'} fontSize="2xs">
                                                        {item.role || 'N/A'}
                                                    </Badge>
                                                </Flex>
                                            </Td>
                                            <Td py={2.5}>
                                                <LaneSelect
                                                    guildId={guild}
                                                    userId={item.userId}
                                                    currentLane={item.lane || ''}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                    {members.length === 0 && (
                                        <Tr>
                                            <Td colSpan={3} textAlign="center" py={10} color="TextSecondary">
                                                <Flex direction="column" align="center" gap={2}>
                                                    <Icon as={BsCalendarCheck} w={8} h={8} opacity={0.3} />
                                                    <Text fontSize="sm">Chưa có ai đăng ký tài khoản</Text>
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </Box>
            </Box>
        </Flex>
    );
};

GwMembersPage.getLayout = (c) => getGuildLayout({ children: c });
export default GwMembersPage;
