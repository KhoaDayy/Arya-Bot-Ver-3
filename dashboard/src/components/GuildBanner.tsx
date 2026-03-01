import { FiSettings as SettingsIcon } from 'react-icons/fi';
import { Flex, Heading, Text, Box } from '@chakra-ui/layout';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { guild as view } from '@/config/translations/guild';
import { useRouter } from 'next/router';
import Link from 'next/link';

export function Banner() {
  const { guild } = useRouter().query as { guild: string };
  const t = view.useTranslations();

  return (
    <Box
      position="relative"
      overflow="hidden"
      rounded="2xl"
      bgGradient="linear(135deg, #1a0a55 0%, #2d1a9e 40%, #422AFB 100%)"
      bgImg={{ '3sm': '/Banner1.png' }}
      bgSize="cover"
      bgPosition="center"
      boxShadow="0 8px 32px rgba(30, 10, 80, 0.5)"
    >
      {/* Dark overlay — ensures white text readability in both modes */}
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(135deg, rgba(26, 10, 85, 0.85) 0%, rgba(45, 26, 158, 0.7) 50%, rgba(66, 42, 251, 0.6) 100%)"
        pointerEvents="none"
      />

      {/* Decorative blobs */}
      <Box
        position="absolute"
        top="-40px"
        right="-40px"
        w="200px"
        h="200px"
        rounded="full"
        bg="whiteAlpha.100"
        filter="blur(40px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="30%"
        w="150px"
        h="150px"
        rounded="full"
        bg="whiteAlpha.100"
        filter="blur(30px)"
        pointerEvents="none"
      />

      <Flex
        direction="column"
        px={{ base: 6, lg: 10 }}
        py={{ base: 6, lg: 8 }}
        gap={2}
        position="relative"
        zIndex={1}
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          color="whiteAlpha.800"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Bảng điều khiển Server
        </Text>
        <Heading
          color="white"
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="800"
          lineHeight="shorter"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
        >
          {t.banner.title}
        </Heading>
        <Text color="whiteAlpha.800" fontSize="sm" maxW="500px">
          {t.banner.description}
        </Text>
        <ButtonGroup mt={4} gap={2}>
          <Button
            leftIcon={<SettingsIcon />}
            color="white"
            bg="whiteAlpha.200"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.300"
            _hover={{
              bg: 'whiteAlpha.300',
              borderColor: 'whiteAlpha.500',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
            _active={{
              bg: 'whiteAlpha.400',
              transform: 'translateY(0)',
            }}
            transition="all 0.2s ease"
            as={Link}
            href={`/guilds/${guild}/settings`}
            rounded="xl"
            fontWeight="600"
          >
            {t.bn.settings}
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
}
