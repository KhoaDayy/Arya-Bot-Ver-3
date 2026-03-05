import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { FaDiscord, FaGamepad, FaImage, FaSearch, FaUserFriends, FaChartPie } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { config } from '@/config/common';

export default function HomeView() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const features = [
    {
      icon: FaGamepad,
      title: 'Guild War',
      description: 'Quản lý đăng ký Guild War, tự động post báo danh, ping lịch trận đấu...',
      color: 'red.400',
      bg: 'red.50',
      darkBg: 'rgba(245, 101, 101, 0.15)',
    },
    {
      icon: FaImage,
      title: 'Face Converter',
      description: 'Chuyển khuôn mặt từ phiên bản CN sang Global.',
      color: 'blue.400',
      bg: 'blue.50',
      darkBg: 'rgba(66, 153, 225, 0.15)',
    },
    {
      icon: BsStars,
      title: 'AI Chat',
      description: 'Chat AI thông minh với Arya, trả lời mọi câu hỏi trực tiếp.',
      color: 'orange.400',
      bg: 'orange.50',
      darkBg: 'rgba(237, 137, 54, 0.15)',
    },
    {
      icon: FaUserFriends,
      title: 'Player Lookup',
      description: 'Tra cứu thông tin player WWM.',
      color: 'purple.400',
      bg: 'purple.50',
      darkBg: 'rgba(159, 122, 234, 0.15)',
    },
    {
      icon: FaSearch,
      title: 'Anime Search',
      description: 'Tìm kiếm anime, xem thông tin, trailer và rating.',
      color: 'cyan.400',
      bg: 'cyan.50',
      darkBg: 'rgba(0, 181, 216, 0.15)',
    },
    {
      icon: FaChartPie,
      title: 'Dashboard',
      description: 'Quản lý toàn bộ tính năng bot qua giao diện web hiện đại.',
      color: 'pink.400',
      bg: 'pink.50',
      darkBg: 'rgba(237, 100, 166, 0.15)',
    },
  ];

  const AppIcon = config.icon;

  return (
    <Box>
      {/* Banner */}
      <Box
        rounded="2xl"
        p={{ base: 6, md: 10 }}
        bgGradient="linear(to-r, #30186e, #4318FF, #7551FF, #4318FF)"
        color="white"
        mb={10}
        shadow="xl"
      >
        <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
          <Box w="100px" h="100px" bg="white" rounded="2xl" p={1} flexShrink={0}>
            {AppIcon && <AppIcon w="full" h="full" rounded="xl" />}
          </Box>
          <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
            <Flex align="center" gap={3} mb={2} justify={{ base: 'center', md: 'flex-start' }}>
              <Heading size="xl" fontWeight="800">{config.name}</Heading>
              <Badge colorScheme="whiteAlpha" bg="whiteAlpha.300" color="white" px={2} py={0.5} rounded="md">v3.0</Badge>
            </Flex>
            <Text fontSize="md" color="whiteAlpha.800" maxW="2xl" mb={6}>
              Bot Discord đa chức năng — Guild War, AI Chat, Face Converter, Player Lookup và nhiều hơn nữa.
            </Text>
            <Button
              as="a"
              href={config.inviteUrl}
              target="_blank"
              leftIcon={<FaDiscord />}
              bg="whiteAlpha.200"
              color="white"
              _hover={{ bg: 'whiteAlpha.300' }}
              variant="solid"
              rounded="xl"
            >
              Invite Now
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Features */}
      <Box mb={10}>
        <Flex align="center" gap={2} mb={2}>
          <Icon as={BsStars} color="orange.400" w={5} h={5} />
          <Heading size="md" fontWeight="700">Tính năng nổi bật</Heading>
        </Flex>
        <Text fontSize="sm" color="TextSecondary" mb={6}>Khám phá những gì {config.name} có thể làm cho server của bạn</Text>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {features.map((feature, idx) => (
            <Box
              key={idx}
              p={6}
              bg={bg}
              rounded="2xl"
              border="1px solid"
              borderColor={borderColor}
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', shadow: 'sm', borderColor: feature.color }}
            >
              <Flex
                align="center"
                justify="center"
                w={12}
                h={12}
                rounded="xl"
                bg={feature.bg}
                _dark={{ bg: feature.darkBg }}
                color={feature.color}
                mb={4}
              >
                <Icon as={feature.icon} w={5} h={5} />
              </Flex>
              <Heading size="sm" mb={2} fontWeight="700">
                {feature.title}
              </Heading>
              <Text fontSize="sm" color="TextSecondary" lineHeight="tall">{feature.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Servers section title */}
      <Box>
        <Heading size="md" fontWeight="700" mb={1}>Chọn Server</Heading>
        <Text fontSize="sm" color="TextSecondary" mb={4}>Chọn server để cấu hình</Text>
      </Box>
    </Box>
  );
}
