import { Avatar, Box, Flex, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react';
import { Guild, iconUrl } from '@/api/discord';
import Link from 'next/link';

export function GuildItem({
  guild,
  active,
  href,
}: {
  guild: Guild;
  active: boolean;
  href: string;
}) {
  return (
    <Box
      as={Link}
      href={href}
      display="flex"
      alignItems="center"
      gap={3}
      px={3}
      py={2.5}
      rounded="xl"
      cursor="pointer"
      position="relative"
      bg={active ? 'brandAlpha.100' : 'transparent'}
      _dark={{
        bg: active ? 'brandAlpha.100' : 'transparent',
      }}
      _hover={{
        bg: active ? 'brandAlpha.100' : 'whiteAlpha.100',
        _light: {
          bg: active ? 'brandAlpha.100' : 'blackAlpha.50',
        },
      }}
      transition="all 0.2s ease"
      borderLeft="3px solid"
      borderLeftColor={active ? 'brand.400' : 'transparent'}
    >
      <Avatar
        name={guild.name}
        src={iconUrl(guild)}
        size="sm"
        boxShadow={active ? '0 0 12px rgba(117, 81, 255, 0.5)' : 'none'}
      />
      <Text
        fontWeight={active ? '700' : '500'}
        fontSize="sm"
        color={active ? 'brand.400' : 'TextSecondary'}
        _dark={{ color: active ? 'brand.200' : 'TextSecondary' }}
        noOfLines={1}
        flex={1}
      >
        {guild.name}
      </Text>
      {active && (
        <Box w={2} h={2} rounded="full" bg="brand.400" flexShrink={0} />
      )}
    </Box>
  );
}

export function GuildItemsSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <Flex key={i} align="center" gap={3} px={3} py={2.5}>
          <SkeletonCircle size="8" flexShrink={0} />
          <Skeleton h="14px" flex={1} rounded="md" />
        </Flex>
      ))}
    </>
  );
}

