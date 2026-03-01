import {
  Avatar,
  Box,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useActiveSidebarItem, SidebarItemInfo } from '@/utils/router';
import { useGuilds, useSelfUserQuery, useBotGuildsQuery } from '@/api/hooks';
import { SearchBar } from '@/components/forms/SearchBar';
import { useMemo, useState } from 'react';
import { config } from '@/config/common';
import { FiSettings as SettingsIcon } from 'react-icons/fi';
import { avatarUrl } from '@/api/discord';
import { GuildItem, GuildItemsSkeleton } from './GuildItem';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SidebarItem } from './SidebarItem';
import items from '@/config/sidebar-items';

export function SidebarContent() {
  const [filter, setFilter] = useState('');
  const guilds = useGuilds();
  const { guild: selectedGroup } = useRouter().query as {
    guild: string;
  };

  const user = useSelfUserQuery();
  const botGuilds = useBotGuildsQuery();

  const filteredGuilds = useMemo(
    () =>
      guilds.data?.filter((guild) => {
        const contains = guild.name.toLowerCase().includes(filter.toLowerCase());
        return config.guild.filter(guild, user?.data, botGuilds?.data) && contains;
      }),
    [guilds.data, filter, user?.data, botGuilds?.data]
  );

  return (
    <>
      {/* Logo + Bot Name */}
      <Flex
        align="center"
        gap={3}
        px={4}
        py={4}
        mx={3}
        my={2}
        rounded="2xl"
        bg="linear-gradient(135deg, #422AFB 0%, #7551FF 100%)"
        boxShadow="0 4px 20px rgba(66, 42, 251, 0.35)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-20px"
          right="-20px"
          w="80px"
          h="80px"
          rounded="full"
          bg="whiteAlpha.100"
          pointerEvents="none"
        />
        <Flex
          w="36px"
          h="36px"
          rounded="lg"
          bg="whiteAlpha.200"
          align="center"
          justify="center"
          flexShrink={0}
        >
          {config.icon?.({ w: 5, h: 5 })}
        </Flex>
        <Box>
          <Text fontSize="md" fontWeight="800" color="white" lineHeight="shorter">
            {config.name}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.700" fontWeight="500">
            Bảng điều khiển
          </Text>
        </Box>
      </Flex>

      <Stack direction="column" mb="auto" gap={0}>
        <Items />

        {/* Server Section */}
        <Box px={4} pt={3} pb={1}>
          <Text
            fontSize="xs"
            fontWeight="700"
            color="TextSecondary"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Servers
          </Text>
        </Box>
        <Box px={3} pb={2}>
          <SearchBar
            w="full"
            input={{
              value: filter,
              onChange: (e) => setFilter(e.target.value),
            }}
          />
        </Box>
        <Flex direction="column" px={3} gap={0.5}>
          {filteredGuilds == null ? (
            <GuildItemsSkeleton />
          ) : (
            filteredGuilds?.map((guild) => (
              <GuildItem
                key={guild.id}
                guild={guild}
                active={selectedGroup === guild.id}
                href={`/guilds/${guild.id}`}
              />
            ))
          )}
        </Flex>
      </Stack>
    </>
  );
}

export function BottomCard() {
  const user = useSelfUserQuery().data;
  if (user == null) return <></>;

  return (
    <Box
      pos="sticky"
      left={0}
      bottom={0}
      w="full"
      p={3}
      borderTop="1px solid"
      borderTopColor="whiteAlpha.100"
      _light={{ borderTopColor: 'blackAlpha.100' }}
      bg="MainBackground"
    >
      <HStack
        px={3}
        py={2.5}
        rounded="xl"
        bg="whiteAlpha.100"
        _light={{ bg: 'blackAlpha.50' }}
        gap={3}
      >
        <Avatar src={avatarUrl(user)} name={user.username} size="sm" />
        <Box flex={1} minW={0}>
          <Text fontWeight="700" fontSize="sm" noOfLines={1}>{user.username}</Text>
          <Text fontSize="xs" color="TextSecondary">Trực tuyến</Text>
        </Box>
        <Link href="/user/profile">
          <IconButton
            icon={<SettingsIcon />}
            aria-label="settings"
            size="sm"
            variant="ghost"
            rounded="lg"
          />
        </Link>
      </HStack>
    </Box>
  );
}

function Items() {
  const active = useActiveSidebarItem();

  return (
    <Flex direction="column" px={3} gap={0.5} pt={1}>
      {items
        .filter((item) => !item.hidden)
        .map((route: SidebarItemInfo, index: number) => (
          <SidebarItem
            key={index}
            href={route.path}
            name={route.name}
            icon={route.icon}
            active={active === route}
          />
        ))}
    </Flex>
  );
}
