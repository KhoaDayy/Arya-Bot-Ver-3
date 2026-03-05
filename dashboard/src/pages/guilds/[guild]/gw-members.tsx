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
    Input,
    InputGroup,
    InputLeftElement,
    IconButton,
    Button,
    Tooltip,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { BsPeopleFill, BsCalendarCheck, BsSearch, BsDownload, BsFunnel } from 'react-icons/bs';
import { FaEdit, FaTrash, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import { useGwMembersQuery, useUpdateGwMemberMutation, useDeleteGwMemberMutation } from '@/api/hooks';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import { useState, useMemo, useCallback } from 'react';

// ─── Constants ──────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const ROLE_OPTIONS = [
    '', 'DPS - Quạt dù công', 'DPS - Vô danh', 'DPS - Song đao', 'DPS - Cửu kiếm',
    'Flex / 3 chỉ', 'Tank', 'Healer'
];

const LANE_OPTIONS = [
    '', 'Top (Đường Trên)', 'Jungle (Đi Rừng)', 'Mid (Đường Giữa)', 'Bot (Đường Dưới)'
];

type SortField = 'username' | 'ingameName' | 'role' | 'lane';
type SortDir = 'asc' | 'desc' | null;

// ─── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <Box
            p={4}
            rounded="2xl"
            bgColor="PanelBoundary"
            shadow="md"
            position="relative"
            overflow="hidden"
            transition="transform 0.2s ease, box-shadow 0.2s ease"
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
        >
            <Box position="absolute" top={-3} right={-3} w="60px" h="60px" rounded="full" bg={`${color}20`} pointerEvents="none" />
            <Flex align="center" gap={3}>
                <Flex w="40px" h="40px" rounded="xl" bg={`${color}20`} align="center" justify="center" flexShrink={0}>
                    <Icon as={icon} w={4} h={4} color={color} />
                </Flex>
                <Box>
                    <Text fontSize="xs" color="TextSecondary" fontWeight="600" textTransform="uppercase" letterSpacing="wide">{label}</Text>
                    <Text fontSize="xl" fontWeight="800" lineHeight="shorter">{value}</Text>
                </Box>
            </Flex>
        </Box>
    );
}

// ─── Charts ─────────────────────────────────────────────────────────────────────

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
        <Box rounded="2xl" overflow="hidden" shadow="md" bgColor="PanelBoundary" border="1px solid" borderColor="whiteAlpha.100" _light={{ borderColor: 'blackAlpha.100' }}>
            <Flex align="center" px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100" _light={{ borderColor: 'blackAlpha.100' }}>
                <Box>
                    <Heading size="sm" fontWeight="700">Thống Kê Vai Trò (Role)</Heading>
                    <Text fontSize="xs" color="TextSecondary">Tổng hợp cố định</Text>
                </Box>
            </Flex>
            <Box p={4} h="220px" display="flex" alignItems="center" justifyContent="center">
                {data.length === 0 ? (
                    <Text color="TextSecondary" fontSize="sm">Chưa có dữ liệu</Text>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
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
        <Box rounded="2xl" overflow="hidden" shadow="md" bgColor="PanelBoundary" border="1px solid" borderColor="whiteAlpha.100" _light={{ borderColor: 'blackAlpha.100' }}>
            <Flex align="center" px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100" _light={{ borderColor: 'blackAlpha.100' }}>
                <Box>
                    <Heading size="sm" fontWeight="700">Thống Kê Vị Trí (Lane)</Heading>
                    <Text fontSize="xs" color="TextSecondary">Tổng hợp cố định</Text>
                </Box>
            </Flex>
            <Box p={4} h="220px" display="flex" alignItems="center" justifyContent="center">
                {members.length === 0 ? (
                    <Text color="TextSecondary" fontSize="sm">Chưa có dữ liệu</Text>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <RechartsTooltip
                                cursor={{ fill: cursorFill }}
                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                itemStyle={{ color: tooltipText }}
                                formatter={(value: any, _name: any, props: any) => [value + ' người', props.payload.full]}
                                labelStyle={{ display: 'none' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
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

// ─── Edit Member Modal ──────────────────────────────────────────────────────────

function EditMemberModal({ isOpen, onClose, member, guildId }: {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    guildId: string;
}) {
    const toast = useToast();
    const mutation = useUpdateGwMemberMutation();
    const [ingameName, setIngameName] = useState(member?.ingameName || '');
    const [role, setRole] = useState(member?.role || '');
    const [lane, setLane] = useState(member?.lane || '');

    // Sync state when member changes
    const handleOpen = useCallback(() => {
        if (member) {
            setIngameName(member.ingameName || '');
            setRole(member.role || '');
            setLane(member.lane || '');
        }
    }, [member]);

    // Call handleOpen when modal opens
    if (isOpen && member) {
        // Using a trick: check if current state differs from member
        if (ingameName !== (member.ingameName || '') && !mutation.isLoading) {
            handleOpen();
        }
    }

    const handleSave = async () => {
        try {
            await mutation.mutateAsync({
                guild: guildId,
                userId: member.userId,
                data: { ingameName, role, lane }
            });
            toast({ title: 'Đã cập nhật thành viên', status: 'success', duration: 2000, isClosable: true });
            onClose();
        } catch {
            toast({ title: 'Lưu thất bại', status: 'error', duration: 3000, isClosable: true });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent bg="CardBackground" rounded="2xl" mx={4}>
                <ModalHeader fontSize="md" fontWeight="700">
                    Chỉnh sửa — {member?.username}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={4}>
                    <Flex direction="column" gap={4}>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Tên Ingame</FormLabel>
                            <Input
                                value={ingameName}
                                onChange={e => setIngameName(e.target.value)}
                                placeholder="Nhập tên trong game"
                                rounded="xl"
                                variant="main"
                                size="sm"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Vai trò (Role)</FormLabel>
                            <Input
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                placeholder="VD: DPS - Cửu kiếm"
                                rounded="xl"
                                variant="main"
                                size="sm"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Vị trí (Lane)</FormLabel>
                            <Select
                                value={lane}
                                onChange={e => setLane(e.target.value)}
                                rounded="xl"
                                size="sm"
                            >
                                {LANE_OPTIONS.map(l => (
                                    <option key={l} value={l}>{l || '-- Chưa chọn --'}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Flex>
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button size="sm" variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button size="sm" colorScheme="blue" rounded="xl" onClick={handleSave} isLoading={mutation.isLoading}>
                        Lưu
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────────────

function DeleteMemberModal({ isOpen, onClose, member, guildId }: {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    guildId: string;
}) {
    const toast = useToast();
    const mutation = useDeleteGwMemberMutation();

    const handleDelete = async () => {
        try {
            await mutation.mutateAsync({ guild: guildId, userId: member.userId });
            toast({ title: 'Đã xoá thành viên', status: 'success', duration: 2000, isClosable: true });
            onClose();
        } catch {
            toast({ title: 'Xoá thất bại', status: 'error', duration: 3000, isClosable: true });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent bg="CardBackground" rounded="2xl" mx={4}>
                <ModalHeader fontSize="md" fontWeight="700">Xác nhận xoá</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontSize="sm">
                        Bạn có chắc muốn xoá <strong>{member?.username}</strong> ({member?.ingameName || 'N/A'}) khỏi danh sách thành viên Guild War?
                    </Text>
                    <Text fontSize="xs" color="TextSecondary" mt={2}>
                        Thao tác này không thể hoàn tác. Thành viên sẽ được tự động thêm lại nếu họ đăng ký lại.
                    </Text>
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button size="sm" variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button size="sm" colorScheme="red" rounded="xl" onClick={handleDelete} isLoading={mutation.isLoading}>
                        Xoá
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ─── CSV Export ──────────────────────────────────────────────────────────────────

function exportCSV(members: any[]) {
    const headers = ['Discord User', 'User ID', 'Tên Ingame', 'Vai Trò', 'Vị Trí (Lane)'];
    const rows = members.map(m => [
        m.username,
        m.userId,
        m.ingameName || '',
        m.role || '',
        m.lane || '',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guild-war-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Sort Header ────────────────────────────────────────────────────────────────

function SortHeader({ label, field, sortField, sortDir, onSort }: {
    label: string;
    field: SortField;
    sortField: SortField | null;
    sortDir: SortDir;
    onSort: (field: SortField) => void;
}) {
    const isActive = sortField === field;
    return (
        <Th
            color="TextSecondary"
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            pb={3}
            cursor="pointer"
            userSelect="none"
            onClick={() => onSort(field)}
            _hover={{ color: 'TextPrimary' }}
            transition="color 0.15s ease"
        >
            <Flex align="center" gap={1}>
                {label}
                <Icon
                    as={isActive ? (sortDir === 'asc' ? FaSortUp : FaSortDown) : FaSort}
                    w={3}
                    h={3}
                    opacity={isActive ? 1 : 0.3}
                />
            </Flex>
        </Th>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

const GwMembersPage: NextPageWithLayout = () => {
    const guild = useRouter().query.guild as string;
    const query = useGwMembersQuery(guild);
    const members = query.data ?? [];

    // ── State ──
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterLane, setFilterLane] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [page, setPage] = useState(1);
    const [editMember, setEditMember] = useState<any>(null);
    const [deleteMember, setDeleteMember] = useState<any>(null);
    const editModal = useDisclosure();
    const deleteModal = useDisclosure();

    // ── Filtering ──
    const filtered = useMemo(() => {
        let result = [...members];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(m =>
                m.username?.toLowerCase().includes(q) ||
                m.ingameName?.toLowerCase().includes(q) ||
                m.userId?.toLowerCase().includes(q)
            );
        }

        // Filter role
        if (filterRole) {
            result = result.filter(m => m.role?.toLowerCase().includes(filterRole.toLowerCase()));
        }

        // Filter lane
        if (filterLane) {
            result = result.filter(m => m.lane === filterLane);
        }

        return result;
    }, [members, search, filterRole, filterLane]);

    // ── Sorting ──
    const sorted = useMemo(() => {
        if (!sortField || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = (a[sortField] || '').toLowerCase();
            const bVal = (b[sortField] || '').toLowerCase();
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortField, sortDir]);

    // ── Pagination ──
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Reset page when filters change
    useMemo(() => setPage(1), [search, filterRole, filterLane]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortField(null); setSortDir(null); }
            else setSortDir('asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const handleEdit = (member: any) => {
        setEditMember(member);
        editModal.onOpen();
    };

    const handleDelete = (member: any) => {
        setDeleteMember(member);
        deleteModal.onOpen();
    };

    // ── Stats ──
    const topLane = useMemo(() => {
        const lanes = ['Top (Đường Trên)', 'Jungle (Đi Rừng)', 'Mid (Đường Giữa)', 'Bot (Đường Dưới)'];
        let max = 0, name = 'N/A';
        lanes.forEach(l => {
            const count = members.filter(m => m.lane === l).length;
            if (count > max) { max = count; name = l.split(' (')[0]; }
        });
        return max > 0 ? `${name} (${max})` : 'N/A';
    }, [members]);

    const topRole = useMemo(() => {
        const roles = ['quạt', 'vô danh', 'song đao', 'cửu kiếm', 'flex', 'tank', 'healer'];
        const labels: Record<string, string> = { 'quạt': 'Quạt', 'vô danh': 'Vô danh', 'song đao': 'Song đao', 'cửu kiếm': 'Cửu kiếm', 'flex': 'Flex', 'tank': 'Tank', 'healer': 'Healer' };
        let max = 0, name = 'N/A';
        roles.forEach(r => {
            const count = members.filter(m => m.role?.toLowerCase().includes(r)).length;
            if (count > max) { max = count; name = labels[r]; }
        });
        return max > 0 ? `${name} (${max})` : 'N/A';
    }, [members]);

    const roleColorScheme = (role: string) => {
        const r = role?.toLowerCase() || '';
        if (r.includes('quạt') || r.includes('vô danh') || r.includes('song đao') || r.includes('cửu kiếm') || r.includes('dps')) return 'red';
        if (r.includes('healer')) return 'green';
        if (r.includes('tank')) return 'blue';
        if (r.includes('flex') || r.includes('3 chỉ')) return 'purple';
        return 'gray';
    };

    return (
        <Flex direction="column" gap={5}>
            {/* Stat Cards */}
            {!query.isLoading && !query.isError && (
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <StatCard icon={BsPeopleFill} label="Tổng thành viên" value={members.length} color="var(--chakra-colors-blue-400)" />
                    <StatCard
                        icon={BsPeopleFill}
                        label="Có Lane"
                        value={members.filter(m => m.lane).length}
                        color="var(--chakra-colors-green-400)"
                    />
                    <StatCard
                        icon={BsPeopleFill}
                        label="Lane phổ biến"
                        value={topLane}
                        color="var(--chakra-colors-orange-400)"
                    />
                    <StatCard
                        icon={BsPeopleFill}
                        label="Role phổ biến"
                        value={topRole}
                        color="var(--chakra-colors-purple-400)"
                    />
                </SimpleGrid>
            )}

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
                            w="36px" h="36px" rounded="lg"
                            bg="rgba(59, 130, 246, 0.15)"
                            _dark={{ bg: 'rgba(96, 165, 250, 0.15)' }}
                            align="center" justify="center"
                        >
                            <Icon as={BsPeopleFill} w={4} h={4} color="blue.400" />
                        </Flex>
                        <Box>
                            <Heading size="sm" fontWeight="700">Thành Viên Guild War</Heading>
                            <Text fontSize="xs" color="TextSecondary">Hồ sơ người chơi lưu vĩnh viễn</Text>
                        </Box>
                    </HStack>
                    <HStack gap={2}>
                        {!query.isLoading && !query.isError && (
                            <>
                                <Badge colorScheme="blue" rounded="full" px={3} py={1} fontSize="xs">
                                    {filtered.length}/{members.length} người
                                </Badge>
                                <Tooltip label="Xuất CSV" hasArrow>
                                    <IconButton
                                        aria-label="Export CSV"
                                        icon={<Icon as={BsDownload} />}
                                        size="sm"
                                        variant="ghost"
                                        rounded="lg"
                                        onClick={() => exportCSV(sorted)}
                                    />
                                </Tooltip>
                            </>
                        )}
                    </HStack>
                </Flex>

                {/* Search & Filter Bar */}
                <Flex
                    px={5}
                    py={3}
                    gap={3}
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.50"
                    _light={{ borderColor: 'blackAlpha.50' }}
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'stretch', md: 'center' }}
                >
                    <InputGroup size="sm" maxW={{ md: '280px' }}>
                        <InputLeftElement pointerEvents="none">
                            <Icon as={BsSearch} color="TextSecondary" />
                        </InputLeftElement>
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, ingame, ID..."
                            rounded="xl"
                            variant="main"
                        />
                    </InputGroup>
                    <HStack gap={2} flex={1}>
                        <Icon as={BsFunnel} color="TextSecondary" w={3.5} h={3.5} flexShrink={0} />
                        <Select
                            size="sm"
                            rounded="xl"
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value)}
                            placeholder="Tất cả Role"
                            maxW="180px"
                        >
                            {ROLE_OPTIONS.filter(Boolean).map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </Select>
                        <Select
                            size="sm"
                            rounded="xl"
                            value={filterLane}
                            onChange={e => setFilterLane(e.target.value)}
                            placeholder="Tất cả Lane"
                            maxW="180px"
                        >
                            {LANE_OPTIONS.filter(Boolean).map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </Select>
                        {(search || filterRole || filterLane) && (
                            <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => { setSearch(''); setFilterRole(''); setFilterLane(''); }}
                                flexShrink={0}
                            >
                                Xoá bộ lọc
                            </Button>
                        )}
                    </HStack>
                </Flex>

                {/* Table */}
                <Box p={4}>
                    {query.isLoading ? (
                        <Flex justify="center" py={8}><Spinner color="blue.400" /></Flex>
                    ) : query.isError ? (
                        <Flex justify="center" py={8}><Text color="red.400" fontSize="sm">Lỗi lấy dữ liệu</Text></Flex>
                    ) : (
                        <Box overflowX="auto">
                            <Table variant="unstyled" size="sm">
                                <Thead>
                                    <Tr>
                                        <SortHeader label="Discord User" field="username" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                        <SortHeader label="Ingame & Vai trò" field="ingameName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                        <SortHeader label="Vị trí (Lane)" field="lane" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                        <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3} w="80px">
                                            Thao tác
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paged.map((item, idx) => (
                                        <Tr
                                            key={idx}
                                            _hover={{ bgColor: 'whiteAlpha.50', _light: { bgColor: 'blackAlpha.50' } }}
                                            transition="background 0.15s ease"
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
                                                    <Text fontSize="sm" fontWeight="600">
                                                        {item.ingameName || <Text as="span" color="gray.500" fontStyle="italic">Chưa có</Text>}
                                                    </Text>
                                                    <Badge
                                                        w="fit-content"
                                                        colorScheme={roleColorScheme(item.role)}
                                                        fontSize="2xs"
                                                    >
                                                        {item.role || 'N/A'}
                                                    </Badge>
                                                </Flex>
                                            </Td>
                                            <Td py={2.5}>
                                                <Badge
                                                    colorScheme={item.lane ? 'teal' : 'gray'}
                                                    variant={item.lane ? 'subtle' : 'outline'}
                                                    px={2}
                                                    py={0.5}
                                                    rounded="md"
                                                    fontSize="xs"
                                                >
                                                    {item.lane || '-- Trống --'}
                                                </Badge>
                                            </Td>
                                            <Td py={2.5}>
                                                <HStack gap={1}>
                                                    <Tooltip label="Chỉnh sửa" hasArrow>
                                                        <IconButton
                                                            aria-label="Edit"
                                                            icon={<Icon as={FaEdit} />}
                                                            size="xs"
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                            onClick={() => handleEdit(item)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label="Xoá" hasArrow>
                                                        <IconButton
                                                            aria-label="Delete"
                                                            icon={<Icon as={FaTrash} />}
                                                            size="xs"
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={() => handleDelete(item)}
                                                        />
                                                    </Tooltip>
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                    {paged.length === 0 && (
                                        <Tr>
                                            <Td colSpan={4} textAlign="center" py={10} color="TextSecondary">
                                                <Flex direction="column" align="center" gap={2}>
                                                    <Icon as={BsCalendarCheck} w={8} h={8} opacity={0.3} />
                                                    <Text fontSize="sm">
                                                        {search || filterRole || filterLane
                                                            ? 'Không tìm thấy thành viên phù hợp'
                                                            : 'Chưa có ai đăng ký tài khoản'}
                                                    </Text>
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Flex justify="space-between" align="center" mt={4} px={2}>
                                    <Text fontSize="xs" color="TextSecondary">
                                        Trang {page}/{totalPages} · Hiển thị {paged.length}/{sorted.length}
                                    </Text>
                                    <HStack gap={1}>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            isDisabled={page <= 1}
                                        >
                                            ← Trước
                                        </Button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    size="xs"
                                                    variant={page === pageNum ? 'solid' : 'ghost'}
                                                    colorScheme={page === pageNum ? 'blue' : 'gray'}
                                                    onClick={() => setPage(pageNum)}
                                                    minW="28px"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            isDisabled={page >= totalPages}
                                        >
                                            Sau →
                                        </Button>
                                    </HStack>
                                </Flex>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Modals */}
            {editMember && (
                <EditMemberModal
                    isOpen={editModal.isOpen}
                    onClose={() => { editModal.onClose(); setEditMember(null); }}
                    member={editMember}
                    guildId={guild}
                />
            )}
            {deleteMember && (
                <DeleteMemberModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => { deleteModal.onClose(); setDeleteMember(null); }}
                    member={deleteMember}
                    guildId={guild}
                />
            )}
        </Flex>
    );
};

GwMembersPage.getLayout = (c) => getGuildLayout({ back: true, children: c });
export default GwMembersPage;
