import { Center, StackProps, HStack, Text } from '@chakra-ui/layout';
import Link from 'next/link';
import { ReactNode } from 'react';

export function SidebarItem({
  name,
  active,
  icon,
  href,
}: {
  name: ReactNode;
  icon: ReactNode;
  active: boolean;
  href: string;
}) {
  return (
    <CardItem active={active} href={href}>
      <Center
        p={2}
        fontSize="sm"
        bg={active ? 'brand.500' : 'transparent'}
        rounded="xl"
        color={active ? 'white' : 'TextPrimary'}
        border="2px solid"
        borderColor={active ? 'brand.400' : 'blackAlpha.200'}
        boxShadow={`0px 0px 12px ${active ? 'var(--chakra-colors-brandAlpha-500)' : 'transparent'
          }`}
        transition="all 0.2s ease"
        _dark={{
          bg: active ? 'brand.400' : 'transparent',
          borderColor: active ? 'brand.300' : 'whiteAlpha.200',
        }}
      >
        {icon}
      </Center>
      <Text
        fontSize="sm"
        fontWeight={active ? '700' : '500'}
        color={active ? 'TextPrimary' : 'TextSecondary'}
        transition="all 0.2s ease"
      >
        {name}
      </Text>
    </CardItem>
  );
}

function CardItem({ active, href, ...props }: { href: string; active: boolean } & StackProps) {
  return (
    <HStack
      as={Link}
      href={href}
      rounded="xl"
      p={2}
      bg={active ? 'MainBackground' : undefined}
      _dark={{
        bg: active ? 'whiteAlpha.100' : undefined,
      }}
      _hover={{
        bg: active ? undefined : 'whiteAlpha.100',
        _light: {
          bg: active ? undefined : 'blackAlpha.50',
        },
      }}
      cursor="pointer"
      transition="all 0.2s ease"
      {...props}
    />
  );
}
