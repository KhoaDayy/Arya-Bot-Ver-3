import {
  Center,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Button,
  Icon,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  HStack,
  Avatar,
  Select,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

import { LoadingPanel } from '@/components/panel/LoadingPanel';
import { QueryStatus } from '@/components/panel/QueryPanel';
import { config } from '@/config/common';
import { guild as view } from '@/config/translations/guild';
import { BsMailbox, BsFillTrophyFill, BsListCheck, BsPeopleFill, BsCalendarCheck } from 'react-icons/bs';
import { FaRobot, FaFire, FaMedal } from 'react-icons/fa';
import { useGuildInfoQuery, useGuildWarListQuery, useGuildWarRankQuery, useUpdateGuildWarLaneMutation } from '@/api/hooks';
import { useRouter } from 'next/router';
import { Banner } from '@/components/GuildBanner';
import type { CustomGuildInfo } from '@/config/types/custom-types';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';

const GuildPage: NextPageWithLayout = () => {
  const t = view.useTranslations();
  const guild = useRouter().query.guild as string;
  const query = useGuildInfoQuery(guild);

  return (
    <QueryStatus query={query} loading={<LoadingPanel />} error={t.error.load}>
      {query.data != null ? (
        <GuildPanel guild={guild} info={query.data} />
      ) : (
        <NotJoined guild={guild} />
      )}
    </QueryStatus>
  );
};

function StatCard({
  icon,
  label,
  value,
  color,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  isLoading?: boolean;
}) {
  return (
    <Box
      p={5}
      rounded="2xl"
      bgColor="PanelBoundary"
      shadow="md"
      position="relative"
      overflow="hidden"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
    >
      {/* Background accent */}
      <Box
        position="absolute"
        top={-4}
        right={-4}
        w="80px"
        h="80px"
        rounded="full"
        bg={`${color}20`}
        pointerEvents="none"
      />
      <Flex align="center" gap={4}>
        <Flex
          w="48px"
          h="48px"
          rounded="xl"
          bg={`${color}20`}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} w={5} h={5} color={color} />
        </Flex>
        <Box>
          <Text fontSize="xs" color="TextSecondary" fontWeight="600" textTransform="uppercase" letterSpacing="wide">
            {label}
          </Text>
          {isLoading ? (
            <Spinner size="sm" color={color} mt={1} />
          ) : (
            <Text fontSize="2xl" fontWeight="800" lineHeight="shorter">
              {value}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

function GuildPanel({ guild: id, info }: { guild: string; info: CustomGuildInfo }) {
  const warListQuery = useGuildWarListQuery(id);
  const warRankQuery = useGuildWarRankQuery(id);

  const totalSignups = warListQuery.data?.data.length ?? 0;
  const topPlayer = warRankQuery.data?.data[0];
  const totalParticipants = warRankQuery.data?.data.length ?? 0;

  return (
    <Flex direction="column" gap={6}>
      <Banner />

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        <StatCard
          icon={BsPeopleFill}
          label="Đã báo danh tuần này"
          value={warListQuery.isLoading ? '...' : totalSignups}
          color="var(--chakra-colors-blue-400)"
          isLoading={warListQuery.isLoading}
        />
        <StatCard
          icon={BsFillTrophyFill}
          label="Người tham gia tổng"
          value={warRankQuery.isLoading ? '...' : totalParticipants}
          color="var(--chakra-colors-yellow-400)"
          isLoading={warRankQuery.isLoading}
        />
        <StatCard
          icon={FaFire}
          label="Top tham gia"
          value={warRankQuery.isLoading ? '...' : topPlayer ? `${topPlayer.totalWars} trận` : 'N/A'}
          color="var(--chakra-colors-orange-400)"
          isLoading={warRankQuery.isLoading}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
        <GuildWarListPanel guild={id} />
        <GuildWarRankPanel guild={id} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
        <GuildWarLaneStatsPanel guild={id} />
        <GuildWarRoleStatsPanel guild={id} />
      </SimpleGrid>
    </Flex>
  );
}

function GuildWarListPanel({ guild }: { guild: string }) {
  const query = useGuildWarListQuery(guild);
  const weekNum = query.data?.week?.split('-W')[1] ?? 'N/A';

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
            <Icon as={BsListCheck} w={4} h={4} color="blue.400" />
          </Flex>
          <Box>
            <Heading size="sm" fontWeight="700">Danh Sách Báo Danh</Heading>
            <Text fontSize="xs" color="TextSecondary">Tuần {weekNum}</Text>
          </Box>
        </HStack>
        {!query.isLoading && !query.isError && (
          <Badge colorScheme="blue" rounded="full" px={3} py={1} fontSize="xs">
            {query.data?.data.length ?? 0} người
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
                  <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Discord ID</Th>
                  <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Ingame & Vai trò</Th>
                  <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Ngày tham gia</Th>
                  <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Vị trí (Lane)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {query.data?.data.map((item, idx) => (
                  <Tr
                    key={idx}
                    _hover={{ bgColor: 'whiteAlpha.50', _light: { bgColor: 'blackAlpha.50' } }}
                    transition="background 0.15s ease"
                    rounded="lg"
                  >
                    <Td py={2.5}>
                      <Badge colorScheme="purple" variant="subtle" px={2.5} py={0.5} rounded="full" fontSize="xs">
                        {item.userId}
                      </Badge>
                    </Td>
                    <Td py={2.5}>
                      <Flex direction="column" gap={1}>
                        <Text fontSize="sm" fontWeight="600">{item.ingameName || <Text as="span" color="gray.500" fontStyle="italic">Chưa có</Text>}</Text>
                        <Badge w="fit-content" colorScheme={item.role === 'DPS' ? 'red' : item.role === 'Healer' ? 'green' : item.role === 'Tank' ? 'blue' : 'gray'} fontSize="2xs">
                          {item.role || 'N/A'}
                        </Badge>
                      </Flex>
                    </Td>
                    <Td py={2.5}>
                      <HStack gap={2} flexWrap="wrap">
                        {item.days.map((d) => (
                          <Badge key={d} colorScheme={d === 'T7' ? 'cyan' : 'orange'} rounded="full" px={2.5} fontSize="xs">
                            {d === 'T7' ? 'Thứ 7' : 'Chủ Nhật'}
                          </Badge>
                        ))}
                      </HStack>
                    </Td>
                    <Td py={2.5}>
                      <LaneSelect
                        guildId={guild}
                        weekId={query.data?.week || ''}
                        userId={item.rawUserId || ''}
                        currentLane={item.lane || ''}
                      />
                    </Td>
                  </Tr>
                ))}
                {query.data?.data.length === 0 && (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={10} color="TextSecondary">
                      <Flex direction="column" align="center" gap={2}>
                        <Icon as={BsCalendarCheck} w={8} h={8} opacity={0.3} />
                        <Text fontSize="sm">Chưa có ai báo danh trong tuần này</Text>
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
  );
}

function GuildWarRankPanel({ guild }: { guild: string }) {
  const query = useGuildWarRankQuery(guild);

  const medalColor = (idx: number) => {
    if (idx === 0) return 'yellow.300';
    if (idx === 1) return 'gray.300';
    if (idx === 2) return 'orange.400';
    return 'TextSecondary';
  };

  const rankLabel = (idx: number) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
  };

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
            bg="rgba(234, 179, 8, 0.15)"
            _dark={{ bg: 'rgba(250, 204, 21, 0.15)' }}
            align="center"
            justify="center"
          >
            <Icon as={BsFillTrophyFill} w={4} h={4} color="yellow.400" />
          </Flex>
          <Box>
            <Heading size="sm" fontWeight="700">Bảng Vàng Chăm Chỉ</Heading>
            <Text fontSize="xs" color="TextSecondary">Xếp hạng tổng tham gia</Text>
          </Box>
        </HStack>
        {!query.isLoading && !query.isError && (
          <Badge colorScheme="yellow" rounded="full" px={3} py={1} fontSize="xs">
            {query.data?.data.length ?? 0} người
          </Badge>
        )}
      </Flex>

      <Box p={4}>
        {query.isLoading ? (
          <Flex justify="center" py={8}>
            <Spinner color="yellow.400" />
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
                  <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Hạng</Th>
                  <Th color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Discord ID</Th>
                  <Th isNumeric color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Tổng</Th>
                  <Th isNumeric color="TextSecondary" fontSize="xs" textTransform="uppercase" letterSpacing="wider" pb={3}>Chuỗi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {query.data?.data.map((item, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <Tr
                      key={idx}
                      _hover={{ bgColor: 'whiteAlpha.50', _light: { bgColor: 'blackAlpha.50' } }}
                      transition="background 0.15s ease"
                    >
                      <Td py={2.5}>
                        <Text
                          fontWeight="700"
                          fontSize={isTop3 ? 'md' : 'sm'}
                          color={medalColor(idx)}
                        >
                          {rankLabel(idx)}
                        </Text>
                      </Td>
                      <Td py={2.5}>
                        <Badge
                          colorScheme={isTop3 ? 'purple' : 'gray'}
                          variant="subtle"
                          px={2.5}
                          py={0.5}
                          rounded="full"
                          fontSize="xs"
                        >
                          {item.userId}
                        </Badge>
                      </Td>
                      <Td isNumeric py={2.5}>
                        <Text fontWeight="700" color="blue.300" fontSize="sm">
                          {item.totalWars}
                        </Text>
                      </Td>
                      <Td isNumeric py={2.5}>
                        <HStack justify="flex-end" gap={1}>
                          <Icon as={FaFire} w={3} h={3} color="orange.400" />
                          <Text color="orange.300" fontSize="sm" fontWeight="600">
                            {item.consecutiveWeeks}w
                          </Text>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
                {query.data?.data.length === 0 && (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={10} color="TextSecondary">
                      <Flex direction="column" align="center" gap={2}>
                        <Icon as={FaMedal} w={8} h={8} opacity={0.3} />
                        <Text fontSize="sm">Chưa có dữ liệu tham gia</Text>
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
  );
}

function GuildWarLaneStatsPanel({ guild }: { guild: string }) {
  const query = useGuildWarListQuery(guild);
  const tooltipBg = useColorModeValue('white', '#1E1E2D');
  const tooltipBorder = useColorModeValue('#E2E8F0', '#2d2d3d');
  const tooltipText = useColorModeValue('#1A202C', '#F7FAFC');
  const axisColor = useColorModeValue('#A0AEC0', '#718096');
  const cursorFill = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)');

  if (query.isLoading || query.isError) return null;

  const regs = query.data?.data || [];

  const getCount = (laneValue: string) => regs.filter(r => r.lane === laneValue).length;

  const data = [
    { name: 'Top', full: 'Top (Đường Trên)', value: getCount('Top (Đường Trên)'), color: '#F6AD55' },
    { name: 'Jungle', full: 'Jungle (Đi Rừng)', value: getCount('Jungle (Đi Rừng)'), color: '#68D391' },
    { name: 'Mid', full: 'Mid (Đường Giữa)', value: getCount('Mid (Đường Giữa)'), color: '#63B3ED' },
    { name: 'Bot', full: 'Bot (Đường Dưới)', value: getCount('Bot (Đường Dưới)'), color: '#B794F4' }
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
          <Heading size="sm" fontWeight="700">Thống Kê Vị Trí Đi Đường (Lane)</Heading>
          <Text fontSize="xs" color="TextSecondary">Tuần {query.data?.week?.split('-W')[1] ?? 'N/A'}</Text>
        </Box>
      </Flex>
      <Box p={4} h="250px" display="flex" alignItems="center" justifyContent="center">
        {regs.length === 0 ? (
          <Text color="TextSecondary" fontSize="sm">Chưa có dữ liệu report</Text>
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

function GuildWarRoleStatsPanel({ guild }: { guild: string }) {
  const query = useGuildWarListQuery(guild);
  const tooltipBg = useColorModeValue('white', '#1E1E2D');
  const tooltipBorder = useColorModeValue('#E2E8F0', '#2d2d3d');
  const tooltipText = useColorModeValue('#1A202C', '#F7FAFC');

  if (query.isLoading || query.isError) return null;

  const regs = query.data?.data || [];

  // Đếm động tất cả role (freeform), bỏ qua role rỗng
  const ROLE_COLORS = ['#FC8181', '#63B3ED', '#68D391', '#F6AD55', '#B794F4', '#F687B3', '#76E4F7', '#FBD38D'];
  const roleCounts = new Map<string, number>();
  regs.forEach(r => {
    const role = (r.role || '').trim();
    if (role) roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
  });
  const data = Array.from(roleCounts.entries()).map(([name, value], idx) => ({
    name,
    value,
    color: ROLE_COLORS[idx % ROLE_COLORS.length],
  }));

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
          <Text fontSize="xs" color="TextSecondary">Tuần {query.data?.week?.split('-W')[1] ?? 'N/A'}</Text>
        </Box>
      </Flex>
      <Box p={4} h="250px" display="flex" alignItems="center" justifyContent="center">
        {data.length === 0 ? (
          <Text color="TextSecondary" fontSize="sm">Chưa có dữ liệu report</Text>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
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
      <Flex justify="center" gap={4} pb={4} flexWrap="wrap">
        {data.map((entry, index) => (
          <Flex align="center" gap={2} key={index}>
            <Box w={3} h={3} rounded="full" bg={entry.color} />
            <Text fontSize="xs" fontWeight="500">{entry.name} ({entry.value})</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

function NotJoined({ guild }: { guild: string }) {
  const t = view.useTranslations();

  return (
    <Center flexDirection="column" gap={4} h="full" p={10}>
      <Box
        p={5}
        rounded="full"
        bg="whiteAlpha.100"
        _light={{ bg: 'blackAlpha.50' }}
      >
        <Icon as={BsMailbox} w={12} h={12} color="TextSecondary" />
      </Box>
      <Box textAlign="center">
        <Text fontSize="xl" fontWeight="700" mb={2}>
          {t.error['not found']}
        </Text>
        <Text color="TextSecondary" maxW="360px">
          {t.error['not found description']}
        </Text>
      </Box>
      <Button
        variant="action"
        leftIcon={<FaRobot />}
        px={8}
        size="lg"
        rounded="xl"
        as="a"
        href={`${config.inviteUrl}&guild_id=${guild}`}
        target="_blank"
        mt={2}
      >
        {t.bn.invite}
      </Button>
    </Center>
  );
}

function LaneSelect({ guildId, weekId, userId, currentLane }: { guildId: string, weekId: string, userId: string, currentLane: string }) {
  const mutation = useUpdateGuildWarLaneMutation();
  const toast = useToast();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      if (!userId) {
        toast({ title: 'Người dùng không có ID', status: 'error', isClosable: true });
        return;
      }
      await mutation.mutateAsync({ guild: guildId, weekId, userId, lane: e.target.value });
      toast({
        title: 'Đã lưu vị trí đi đường',
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
      value={currentLane}
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

GuildPage.getLayout = (c) => getGuildLayout({ children: c });
export default GuildPage;
