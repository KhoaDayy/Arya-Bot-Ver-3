import { RiErrorWarningFill as WarningIcon } from 'react-icons/ri';
import { Box, Flex, Heading, Spacer, Text } from '@chakra-ui/layout';
import { ButtonGroup, Button, Icon, Badge, HStack } from '@chakra-ui/react';
import { SlideFade } from '@chakra-ui/react';
import { FeatureConfig, UseFormRenderResult, CustomFeatures } from '@/config/types';
import { IoSave } from 'react-icons/io5';
import { MdOutlineToggleOff } from 'react-icons/md';
import { useEnableFeatureMutation, useUpdateFeatureMutation } from '@/api/hooks';
import { Params } from '@/pages/guilds/[guild]/features/[feature]';
import { feature as view } from '@/config/translations/feature';
import { useRouter } from 'next/router';

export function UpdateFeaturePanel({
  feature,
  config,
}: {
  feature: CustomFeatures[keyof CustomFeatures];
  config: FeatureConfig<keyof CustomFeatures>;
}) {
  const { guild, feature: featureId } = useRouter().query as Params;
  const mutation = useUpdateFeatureMutation();
  const enableMutation = useEnableFeatureMutation();
  const result = config.useRender(feature, (data) => {
    return mutation.mutateAsync({
      guild,
      feature: featureId,
      options: data,
    });
  });

  const onDisable = () => {
    enableMutation.mutate({ enabled: false, guild, feature: featureId });
  };

  return (
    <Flex as="form" onSubmit={result.onSubmit} direction="column" gap={5} w="full" h="full">

      {/* ── Feature Hero Header ── */}
      <Box
        position="relative"
        rounded="2xl"
        overflow="hidden"
        bg="CardBackground"
        border="1px solid"
        borderColor="whiteAlpha.100"
        _light={{ borderColor: 'blackAlpha.150' }}
        p={6}
        boxShadow="normal"
      >
        {/* Decorative accent */}
        <Box
          position="absolute"
          top="-30px"
          right="-30px"
          w="140px"
          h="140px"
          rounded="full"
          bg="brand.500"
          opacity={0.08}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-20px"
          left="40%"
          w="100px"
          h="100px"
          rounded="full"
          bg="purple.500"
          opacity={0.06}
          pointerEvents="none"
        />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
          position="relative"
          zIndex={1}
        >
          <Flex
            w="52px"
            h="52px"
            rounded="xl"
            bg="brand.500"
            bgGradient="linear(135deg, brand.400, brand.600)"
            align="center"
            justify="center"
            fontSize="2xl"
            flexShrink={0}
            boxShadow="0 4px 16px rgba(66, 42, 251, 0.4)"
          >
            {config.icon}
          </Flex>

          <Box flex={1}>
            <HStack gap={2} mb={1} flexWrap="wrap">
              <Heading fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800">
                {config.name}
              </Heading>
              <Badge
                colorScheme="green"
                rounded="full"
                px={3}
                py={0.5}
                fontSize="xs"
                fontWeight="700"
              >
                ● Đang bật
              </Badge>
            </HStack>
            <Text color="TextSecondary" fontSize="sm">
              {config.description}
            </Text>
          </Box>

          <Button
            variant="danger"
            isLoading={enableMutation.isLoading}
            onClick={onDisable}
            leftIcon={<Icon as={MdOutlineToggleOff} w={5} h={5} />}
            size="sm"
            rounded="xl"
            flexShrink={0}
          >
            <view.T text={(e) => e.bn.disable} />
          </Button>
        </Flex>
      </Box>

      {/* ── Form Content ── */}
      {result.component}

      {/* ── Savebar ── */}
      <Savebar isLoading={mutation.isLoading} result={result} />
    </Flex>
  );
}

function Savebar({
  result: { canSave, onSubmit, reset },
  isLoading,
}: {
  result: UseFormRenderResult;
  isLoading: boolean;
}) {
  const t = view.useTranslations();
  const breakpoint = '3sm';

  return (
    <Flex
      as={SlideFade}
      in={canSave}
      bg="CardBackground"
      rounded="2xl"
      zIndex="sticky"
      pos="sticky"
      bottom={{ base: 2, [breakpoint]: '10px' }}
      w="full"
      px={{ base: 3, [breakpoint]: 5 }}
      py={{ base: 2.5, [breakpoint]: 4 }}
      shadow="normal"
      alignItems="center"
      flexDirection={{ base: 'column', [breakpoint]: 'row' }}
      gap={{ base: 2, [breakpoint]: 3 }}
      mt="auto"
      border="1px solid"
      borderColor="brand.400"
      boxShadow="0 0 0 1px rgba(117, 81, 255, 0.3), 0 8px 32px rgba(66, 42, 251, 0.18)"
    >
      <HStack gap={2}>
        <Icon
          as={WarningIcon}
          color="orange.400"
          w="22px"
          h="22px"
          flexShrink={0}
        />
        <Text fontSize={{ base: 'sm', [breakpoint]: 'md' }} fontWeight="600">
          {t.unsaved}
        </Text>
      </HStack>
      <Spacer />
      <ButtonGroup isDisabled={isLoading} size={{ base: 'sm', [breakpoint]: 'md' }} gap={2}>
        <Button
          type="submit"
          variant="action"
          rounded="xl"
          leftIcon={<IoSave />}
          isLoading={isLoading}
          onClick={onSubmit}
        >
          {t.bn.save}
        </Button>
        <Button
          rounded="xl"
          onClick={reset}
          variant="ghost"
        >
          {t.bn.discard}
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
