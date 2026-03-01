import { Box, Center, Flex, Text } from '@chakra-ui/layout';
import { Button, ButtonGroup, Badge, HStack } from '@chakra-ui/react';
import { IdFeature } from '@/utils/common';
import { IoOptions } from 'react-icons/io5';
import { BsToggleOn } from 'react-icons/bs';
import { useEnableFeatureMutation } from '@/api/hooks';
import { guild as view } from '@/config/translations/guild';
import Router from 'next/router';

export function FeatureItem({
  guild,
  feature,
  enabled,
}: {
  guild: string;
  feature: IdFeature;
  enabled: boolean;
}) {
  const t = view.useTranslations();
  const mutation = useEnableFeatureMutation();

  return (
    <Box
      rounded="2xl"
      border="1px solid"
      borderColor={enabled ? 'brand.400' : 'whiteAlpha.100'}
      _light={{
        borderColor: enabled ? 'brand.400' : 'blackAlpha.100',
        bg: 'white',
      }}
      bg="navy.800"
      overflow="hidden"
      transition="all 0.2s ease"
      boxShadow={enabled ? '0 0 16px rgba(117, 81, 255, 0.15)' : 'none'}
      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
    >
      {/* Card Body */}
      <Flex direction="row" align="flex-start" gap={4} p={5}>
        <Center
          bg={enabled ? 'brand.500' : 'brandAlpha.100'}
          bgGradient={enabled ? 'linear(135deg, brand.400, brand.600)' : undefined}
          color={enabled ? 'white' : 'brand.400'}
          rounded="xl"
          w="48px"
          h="48px"
          fontSize="xl"
          flexShrink={0}
          boxShadow={enabled ? '0 4px 12px rgba(66, 42, 251, 0.3)' : 'none'}
          _dark={{
            color: enabled ? 'white' : 'brand.200',
          }}
        >
          {feature.icon}
        </Center>

        <Box flex={1} minW={0}>
          <HStack gap={2} mb={1} flexWrap="wrap">
            <Text fontSize={{ base: '15px', md: 'md' }} fontWeight="700" noOfLines={1}>
              {feature.name}
            </Text>
            {enabled ? (
              <Badge colorScheme="green" rounded="full" px={2} py={0.5} fontSize="2xs" fontWeight="700">
                ● Đang bật
              </Badge>
            ) : (
              <Badge colorScheme="gray" rounded="full" px={2} py={0.5} fontSize="2xs">
                Chưa bật
              </Badge>
            )}
          </HStack>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="TextSecondary" noOfLines={2}>
            {feature.description}
          </Text>
        </Box>
      </Flex>

      {/* Card Footer */}
      <Flex
        px={5}
        pb={4}
        justify="flex-end"
        borderTop="1px solid"
        borderColor="whiteAlpha.50"
        _light={{ borderColor: 'blackAlpha.50' }}
        pt={3}
      >
        <Button
          size="sm"
          rounded="xl"
          fontWeight="600"
          isLoading={mutation.isLoading}
          {...(enabled
            ? {
              variant: 'action',
              leftIcon: <IoOptions />,
              onClick: () => Router.push(`/guilds/${guild}/features/${feature.id}`),
              children: t.bn['config feature'],
            }
            : {
              variant: 'outline',
              colorScheme: 'brand',
              leftIcon: <BsToggleOn />,
              onClick: () => mutation.mutate({ enabled: true, guild, feature: feature.id }),
              children: t.bn['enable feature'],
            })}
        />
      </Flex>
    </Box>
  );
}
