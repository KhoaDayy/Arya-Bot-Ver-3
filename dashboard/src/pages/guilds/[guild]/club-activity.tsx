import { useState, useMemo } from 'react';
import {
    Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Spinner, Text, HStack, Icon, Select, useToast,
    useColorModeValue, Input, InputGroup, InputLeftElement,
    IconButton, Button, Tooltip, SimpleGrid, Progress,
} from '@chakra-ui/react';
import { BsPeopleFill, BsFillTrophyFill, BsSearch, BsDownload, BsFunnel, BsExclamationTriangleFill, BsLightningChargeFill } from 'react-icons/bs';
import { FaSortUp, FaSortDown, FaSort, FaSync, FaCrown, FaShieldAlt, FaStar, FaFire } from 'react-icons/fa';
import {
    useClubConfigQuery,
    useClubSnapshotsQuery,
    useClubSnapshotQuery,
    useForceClubFetchMutation,
} from '@/api/hooks';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import type { ClubMemberSnapshot } from '@/config/types/custom-types';

// ─── Constants ──────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 25;

const POSITION_OPTIONS = [
    { value: '', label: '' },
    { value: 'Guild Leader', label: 'Guild Leader' },
    { value: 'Vice Leader', label: 'Vice Leader' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Moderator', label: 'Halftime' },
    { value: 'Apprentice', label: 'Apprentice' },
    { value: 'Members', label: 'Members' },
];
const ACTIVITY_FILTER_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Dưới 1000', value: 'low' },
    { label: 'Trên 1000', value: 'high' },
];

// ─── Position colors ─────────────────────────────────────────────────────────

const POSITION_COLORS: Record<string, { color: string; icon: React.ElementType; label?: string; priority: number }> = {
    'guild leader': { color: 'yellow', icon: FaCrown, priority: 1 },
    'vice leader': { color: 'cyan', icon: FaStar, priority: 2 },
    'admin': { color: 'purple', icon: FaShieldAlt, priority: 3 },
    'moderator': { color: 'orange', icon: FaFire, label: 'Halftime', priority: 4 },
    'apprentice': { color: 'blue', icon: BsPeopleFill, priority: 5 },
    'members': { color: 'gray', icon: BsPeopleFill, priority: 6 },
    'member': { color: 'gray', icon: BsPeopleFill, priority: 6 },
};

// Deterministic color for custom roles based on name hash
const CUSTOM_COLORS = ['pink', 'teal', 'green', 'red', 'linkedin', 'telegram', 'messenger', 'whatsapp'];
function hashColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    return CUSTOM_COLORS[Math.abs(hash) % CUSTOM_COLORS.length];
}

function PositionBadge({ position }: { position: string }) {
    const roles = position.split(',').map(r => r.trim()).filter(Boolean);

    // Sort: fixed roles first by priority, then custom roles alphabetically
    roles.sort((a, b) => {
        const pa = POSITION_COLORS[a.toLowerCase()]?.priority ?? 99;
        const pb = POSITION_COLORS[b.toLowerCase()]?.priority ?? 99;
        if (pa !== pb) return pa - pb;
        return a.localeCompare(b);
    });

    return (
        <Flex gap={1} flexWrap="wrap">
            {roles.map((role, i) => {
                const known = POSITION_COLORS[role.toLowerCase()];
                const color = known?.color ?? hashColor(role);
                const icon = known?.icon ?? BsFillTrophyFill;
                const label = known?.label ?? role;
                return (
                    <Badge
                        key={i}
                        colorScheme={color}
                        fontSize="2xs"
                        rounded="md"
                        px={2}
                        py={0.5}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        w="fit-content"
                    >
                        <Icon as={icon} w={2.5} h={2.5} />
                        {label}
                    </Badge>
                );
            })}
        </Flex>
    );
}

// ─── CSV Export ──────────────────────────────────────────────────────────────────

type SortField = 'nickname' | 'level' | 'week_activity_point' | 'last_week_activity' | 'month_activity' | 'total_activity' | 'week_fund' | 'total_fund';
type SortDir = 'asc' | 'desc' | null;

function fmt(n: number | undefined | null): string {
    if (n == null) return '0';
    return n.toLocaleString('vi-VN');
}

// ─── Stat Card (matching gw-members pattern) ────────────────────────────────────

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

// ─── Sort Header (matching gw-members pattern) ─────────────────────────────────

function SortHeader({ label, field, sortField, sortDir, onSort, isNumeric }: {
    label: string;
    field: SortField;
    sortField: SortField | null;
    sortDir: SortDir;
    onSort: (field: SortField) => void;
    isNumeric?: boolean;
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
            isNumeric={isNumeric}
            whiteSpace="nowrap"
        >
            <Flex align="center" gap={1} justify={isNumeric ? 'flex-end' : 'flex-start'}>
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


function exportCSV(members: ClubMemberSnapshot[], weekId: string) {
    const headers = ['Nickname', 'Level', 'Chức vụ', 'Điểm Tuần', 'Tuần Trước', 'Quỹ Tuần', 'Tổng Cống Hiến', 'Tổng Quỹ'];
    const rows = members.map(m => [
        m.nickname, m.level, m.position,
        m.week_activity_point, m.last_week_activity,
        m.week_fund, m.total_activity, m.total_fund,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `club-activity-${weekId || 'latest'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

const ClubActivityPage: NextPageWithLayout = () => {
    const guild = useRouter().query.guild as string;
    const configQuery = useClubConfigQuery(guild);
    const snapshotsQuery = useClubSnapshotsQuery(guild);

    const [selectedWeek, setSelectedWeek] = useState<string | undefined>(undefined);
    const snapshotQuery = useClubSnapshotQuery(guild, selectedWeek);

    const fetchMutation = useForceClubFetchMutation();
    const toast = useToast();

    // ── State ──
    const [search, setSearch] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [filterActivity, setFilterActivity] = useState('');
    const [sortField, setSortField] = useState<SortField | null>('week_activity_point');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(1);

    const dangerBg = useColorModeValue('red.50', 'rgba(248, 113, 113, 0.06)');

    const snapshot = snapshotQuery.data;
    const allMembers = snapshot?.members ?? [];

    // ── Filtering ──
    const filtered = useMemo(() => {
        let result = [...allMembers];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(m =>
                m.nickname?.toLowerCase().includes(q)
            );
        }

        if (filterPosition) {
            result = result.filter(m => m.position?.toLowerCase().includes(filterPosition.toLowerCase()));
        }

        if (filterActivity === 'low') {
            result = result.filter(m => m.week_activity_point < 1000);
        } else if (filterActivity === 'high') {
            result = result.filter(m => m.week_activity_point >= 1000);
        }

        return result;
    }, [allMembers, search, filterPosition, filterActivity]);

    // ── Sorting ──
    const sorted = useMemo(() => {
        if (!sortField || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = a[sortField] ?? 0;
            const bVal = b[sortField] ?? 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
    }, [filtered, sortField, sortDir]);

    // ── Pagination ──
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Reset page when filters change
    useMemo(() => setPage(1), [search, filterPosition, filterActivity]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortField(null); setSortDir(null); }
            else setSortDir('asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const handleFetch = async () => {
        try {
            await fetchMutation.mutateAsync({ guild });
            toast({ title: '✅ Đã cập nhật dữ liệu!', status: 'success', duration: 2500, isClosable: true });
        } catch {
            toast({ title: '❌ Lỗi khi fetch dữ liệu', status: 'error', duration: 3000, isClosable: true });
        }
    };

    // ── Stats ──
    const lowCount = allMembers.filter(m => m.week_activity_point < 1000).length;
    const avgActivity = allMembers.length > 0
        ? Math.round(allMembers.reduce((sum, m) => sum + m.week_activity_point, 0) / allMembers.length)
        : 0;
    const maxActivity = Math.max(...allMembers.map(m => m.week_activity_point), 1);

    // Not linked
    if (configQuery.data && !configQuery.data.clubName) {
        return (
            <Flex direction="column" align="center" justify="center" h="full" gap={5} py={20}>
                <Icon as={BsExclamationTriangleFill} w={12} h={12} color="orange.400" opacity={0.4} />
                <Heading size="md" fontWeight="700">Chưa Liên Kết Bang Hội</Heading>
                <Text color="TextSecondary" textAlign="center" maxW="400px">
                    Dùng lệnh <Badge colorScheme="purple" fontSize="sm" fontFamily="mono">/guild-setup link</Badge> trong Discord để gắn bang hội cho server này.
                </Text>
            </Flex>
        );
    }

    return (
        <Flex direction="column" gap={5}>
            {/* Stat Cards */}
            {!snapshotQuery.isLoading && !snapshotQuery.isError && snapshot && (
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <StatCard icon={BsPeopleFill} label="Thành viên" value={snapshot.memberCount} color="var(--chakra-colors-blue-400)" />
                    <StatCard icon={BsLightningChargeFill} label="TB Điểm/Tuần" value={fmt(avgActivity)} color="var(--chakra-colors-purple-400)" />
                    <StatCard icon={FaFire} label="Liveness Bang" value={fmt(snapshot.clubLiveness)} color="var(--chakra-colors-orange-400)" />
                    <StatCard icon={BsExclamationTriangleFill} label="Dưới 1000 điểm" value={`${lowCount} (${((lowCount / (snapshot.memberCount || 1)) * 100).toFixed(0)}%)`} color="var(--chakra-colors-red-400)" />
                </SimpleGrid>
            )}

            {/* Members Table Panel */}
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
                            <Icon as={BsFillTrophyFill} w={4} h={4} color="blue.400" />
                        </Flex>
                        <Box>
                            <Heading size="sm" fontWeight="700">
                                Cống Hiến {snapshot?.clubName || configQuery.data?.clubName || 'Bang Hội'}
                            </Heading>
                            <Text fontSize="xs" color="TextSecondary">
                                {snapshot?.weekId ? `Tuần ${snapshot.weekId.split('-W')[1]}` : 'Chưa có dữ liệu'}{' · '}
                                {snapshot?.fetchedAt
                                    ? new Date(snapshot.fetchedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                                    : ''}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack gap={2}>
                        <Select
                            size="sm" rounded="xl" w="140px"
                            value={selectedWeek || ''}
                            onChange={e => setSelectedWeek(e.target.value || undefined)}
                        >
                            <option value="">Mới nhất</option>
                            {(snapshotsQuery.data || []).map(w => (
                                <option key={w.weekId} value={w.weekId}>Tuần {w.weekId.split('-W')[1]}</option>
                            ))}
                        </Select>
                        {!snapshotQuery.isLoading && !snapshotQuery.isError && (
                            <>
                                <Badge colorScheme="blue" rounded="full" px={3} py={1} fontSize="xs">
                                    {filtered.length}/{allMembers.length} người
                                </Badge>
                                <Tooltip label="Xuất CSV" hasArrow>
                                    <IconButton
                                        aria-label="Export CSV"
                                        icon={<Icon as={BsDownload} />}
                                        size="sm"
                                        variant="ghost"
                                        rounded="lg"
                                        onClick={() => exportCSV(sorted, snapshot?.weekId || 'latest')}
                                    />
                                </Tooltip>
                                <Tooltip label="Cập nhật dữ liệu" hasArrow>
                                    <IconButton
                                        aria-label="Fetch"
                                        icon={<Icon as={FaSync} />}
                                        size="sm"
                                        variant="ghost"
                                        rounded="lg"
                                        isLoading={fetchMutation.isLoading}
                                        onClick={handleFetch}
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
                            placeholder="Tìm theo tên..."
                            rounded="xl"
                            variant="main"
                        />
                    </InputGroup>
                    <HStack gap={2} flex={1}>
                        <Icon as={BsFunnel} color="TextSecondary" w={3.5} h={3.5} flexShrink={0} />
                        <Select
                            size="sm"
                            rounded="xl"
                            value={filterPosition}
                            onChange={e => setFilterPosition(e.target.value)}
                            placeholder="Tất cả chức vụ"
                            maxW="180px"
                        >
                            {POSITION_OPTIONS.filter(o => o.value).map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </Select>
                        <Select
                            size="sm"
                            rounded="xl"
                            value={filterActivity}
                            onChange={e => setFilterActivity(e.target.value)}
                            maxW="160px"
                        >
                            {ACTIVITY_FILTER_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </Select>
                        {(search || filterPosition || filterActivity) && (
                            <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => { setSearch(''); setFilterPosition(''); setFilterActivity(''); }}
                                flexShrink={0}
                            >
                                Xoá bộ lọc
                            </Button>
                        )}
                    </HStack>
                </Flex>

                {/* Table */}
                <Box p={4}>
                    {snapshotQuery.isLoading ? (
                        <Flex justify="center" py={8}><Spinner color="blue.400" /></Flex>
                    ) : snapshotQuery.isError ? (
                        <Flex justify="center" py={8}><Text color="red.400" fontSize="sm">Lỗi lấy dữ liệu</Text></Flex>
                    ) : (
                        <Box overflowX="auto">
                            <Table variant="unstyled" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3} w="40px">#</Th>
                                        <SortHeader label="Nickname" field="nickname" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                        <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Chức vụ</Th>
                                        <SortHeader label="Lv" field="level" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <SortHeader label="Điểm Tuần" field="week_activity_point" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <Th color="TextSecondary" fontSize="xs" pb={3} w="70px"></Th>
                                        <SortHeader label="Tuần Trước" field="last_week_activity" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <SortHeader label="Quỹ Tuần" field="week_fund" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                        <SortHeader label="Tổng" field="total_activity" sortField={sortField} sortDir={sortDir} onSort={handleSort} isNumeric />
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paged.map((m, idx) => {
                                        const rank = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                                        const isLow = m.week_activity_point < 1000;
                                        return (
                                            <Tr
                                                key={m.pid || idx}
                                                bg={isLow ? dangerBg : undefined}
                                                _hover={{ bgColor: 'whiteAlpha.50', _light: { bgColor: 'blackAlpha.50' } }}
                                                transition="background 0.15s ease"
                                            >
                                                <Td py={2.5}>
                                                    <Text fontSize="xs" fontWeight="700"
                                                        color={rank <= 3 ? ['yellow.400', 'gray.400', 'orange.400'][rank - 1] : 'TextSecondary'}>
                                                        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                                                    </Text>
                                                </Td>
                                                <Td py={2.5}>
                                                    <Text fontSize="sm" fontWeight={isLow ? '700' : '600'} color={isLow ? 'red.400' : undefined}>
                                                        {m.nickname}
                                                    </Text>
                                                </Td>
                                                <Td py={2.5}><PositionBadge position={m.position} /></Td>
                                                <Td isNumeric py={2.5}>
                                                    <Badge bg="whiteAlpha.100" _light={{ bg: 'blackAlpha.50' }} rounded="md" px={2} fontSize="xs">
                                                        {m.level}
                                                    </Badge>
                                                </Td>
                                                <Td isNumeric py={2.5}>
                                                    <Text fontSize="sm" fontWeight="800" color={isLow ? 'red.400' : 'green.400'}>
                                                        {fmt(m.week_activity_point)}
                                                    </Text>
                                                </Td>
                                                <Td py={2.5}>
                                                    <Tooltip label={`${fmt(m.week_activity_point)} / ${fmt(maxActivity)}`} fontSize="xs" rounded="md">
                                                        <Box w="60px">
                                                            <Progress
                                                                value={Math.min((m.week_activity_point / maxActivity) * 100, 100)}
                                                                size="xs" rounded="full"
                                                                bg="whiteAlpha.100"
                                                                sx={{ '& > div': { bg: isLow ? 'red.400' : 'green.400', transition: 'width 0.5s ease' } }}
                                                                _light={{ bg: 'blackAlpha.100' }}
                                                            />
                                                        </Box>
                                                    </Tooltip>
                                                </Td>
                                                <Td isNumeric py={2.5}><Text fontSize="sm" color="TextSecondary">{fmt(m.last_week_activity)}</Text></Td>
                                                <Td isNumeric py={2.5}><Text fontSize="sm" color="yellow.400" fontWeight="600">{fmt(m.week_fund)}</Text></Td>
                                                <Td isNumeric py={2.5}><Text fontSize="sm" fontWeight="600">{fmt(m.total_activity)}</Text></Td>
                                            </Tr>
                                        );
                                    })}
                                    {paged.length === 0 && (
                                        <Tr>
                                            <Td colSpan={9} textAlign="center" py={10} color="TextSecondary">
                                                <Flex direction="column" align="center" gap={2}>
                                                    <Icon as={BsPeopleFill} w={8} h={8} opacity={0.3} />
                                                    <Text fontSize="sm">
                                                        {search || filterPosition || filterActivity
                                                            ? 'Không tìm thấy thành viên phù hợp'
                                                            : 'Chưa có dữ liệu snapshot'}
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
                                            ‹ Trước
                                        </Button>
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let p: number;
                                            if (totalPages <= 5) {
                                                p = i + 1;
                                            } else if (page <= 3) {
                                                p = i + 1;
                                            } else if (page >= totalPages - 2) {
                                                p = totalPages - 4 + i;
                                            } else {
                                                p = page - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={p}
                                                    size="xs"
                                                    variant={page === p ? 'solid' : 'ghost'}
                                                    colorScheme={page === p ? 'blue' : undefined}
                                                    onClick={() => setPage(p)}
                                                    rounded="md"
                                                    minW="28px"
                                                >
                                                    {p}
                                                </Button>
                                            );
                                        })}
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            isDisabled={page >= totalPages}
                                        >
                                            Sau ›
                                        </Button>
                                    </HStack>
                                </Flex>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Flex>
    );
};

ClubActivityPage.getLayout = (c) => getGuildLayout({ children: c, back: true });
export default ClubActivityPage;
