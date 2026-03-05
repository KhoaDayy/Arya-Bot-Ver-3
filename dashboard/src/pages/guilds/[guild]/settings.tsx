import { Box, Flex, Heading, Text, Center, Icon, Button } from '@chakra-ui/react';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import { BsGearFill } from 'react-icons/bs';
import Link from 'next/link';

const GuildSettingsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const guild = router.query.guild as string;

  return (
    <Flex direction="column" h="full">
      <Box ml={{ '3sm': 5 }}>
        <Heading fontSize="2xl" fontWeight="600">
          Cài đặt chung (General)
        </Heading>
        <Text color="TextSecondary" mt={2}>
          Mục cài đặt chung của Server hiện không có thông số nào cần tinh chỉnh. Bạn hãy quay lại trang Guild Home để tùy chỉnh các tính năng riêng biệt nhé.
        </Text>
      </Box>

      <Center flexDirection="column" gap={4} py={20}>
        <Icon as={BsGearFill} w={20} h={20} color="gray.600" />
        <Text fontSize="lg" color="whiteAlpha.700">Chưa hỗ trợ cài đặt ở trang này</Text>
        <Button as={Link} href={`/guilds/${guild}`} variant="action">
          Quay về trang quản lý Tính Năng
        </Button>
      </Center>
    </Flex>
  );
};

GuildSettingsPage.getLayout = (c) => getGuildLayout({ children: c, back: true });
export default GuildSettingsPage;
