import { Icon } from '@chakra-ui/react';
import { Center, Heading, Text, Box, Flex } from '@chakra-ui/layout';
import { Button, Badge } from '@chakra-ui/react';
import { LoadingPanel } from '@/components/panel/LoadingPanel';
import { features } from '@/config/features';
import { CustomFeatures, FeatureConfig } from '@/config/types';
import { BsSearch, BsToggleOn } from 'react-icons/bs';
import { MdOutlineToggleOff } from 'react-icons/md';
import { useEnableFeatureMutation, useFeatureQuery } from '@/api/hooks';
import { UpdateFeaturePanel } from '@/components/feature/UpdateFeaturePanel';
import { feature as view } from '@/config/translations/feature';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';

export type Params = {
  guild: string;
  feature: keyof CustomFeatures;
};

export type UpdateFeatureValue<K extends keyof CustomFeatures> = Partial<CustomFeatures[K]>;

const FeaturePage: NextPageWithLayout = () => {
  const { feature, guild } = useRouter().query as Params;

  const query = useFeatureQuery(guild, feature);
  const featureConfig = features[feature] as FeatureConfig<typeof feature>;
  const skeleton = featureConfig?.useSkeleton?.();

  if (featureConfig == null) return <NotFound />;
  if (query.isError) return <NotEnabled />;
  if (query.isLoading) return skeleton != null ? <>{skeleton}</> : <LoadingPanel />;
  return <UpdateFeaturePanel key={feature} feature={query.data} config={featureConfig} />;
};

function NotEnabled() {
  const t = view.useTranslations();
  const { guild, feature } = useRouter().query as Params;
  const enable = useEnableFeatureMutation();
  const featureConfig = features[feature];

  return (
    <Center flexDirection="column" h="full" gap={0} py={10}>
      <Box
        rounded="2xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        _light={{ borderColor: 'blackAlpha.100', bg: 'white' }}
        bg="navy.800"
        p={8}
        maxW="420px"
        w="full"
        textAlign="center"
      >
        {/* Feature icon */}
        <Flex
          w="64px"
          h="64px"
          rounded="2xl"
          bg="brandAlpha.100"
          align="center"
          justify="center"
          fontSize="2xl"
          mx="auto"
          mb={4}
          border="2px solid"
          borderColor="brand.400"
          boxShadow="0 0 20px rgba(117, 81, 255, 0.2)"
        >
          {featureConfig?.icon}
        </Flex>

        <Badge colorScheme="orange" rounded="full" px={3} py={0.5} mb={3} fontSize="xs">
          ● Chưa bật
        </Badge>

        <Heading fontSize="xl" fontWeight="800" mb={2}>
          {featureConfig?.name}
        </Heading>

        <Text color="TextSecondary" fontSize="sm" mb={1}>
          {t.error['not enabled']}
        </Text>
        <Text color="TextSecondary" fontSize="sm" mb={6}>
          {t.error['not enabled description']}
        </Text>

        <Button
          isLoading={enable.isLoading}
          onClick={() => enable.mutate({ enabled: true, guild, feature })}
          variant="action"
          w="full"
          rounded="xl"
          leftIcon={<Icon as={BsToggleOn} w={5} h={5} />}
          size="lg"
          fontWeight="700"
        >
          {t.bn.enable}
        </Button>
      </Box>
    </Center>
  );
}

function NotFound() {
  const t = view.useTranslations();

  return (
    <Center flexDirection="column" gap={3} h="full">
      <Box
        p={5}
        rounded="full"
        bg="whiteAlpha.100"
        _light={{ bg: 'blackAlpha.50' }}
      >
        <Icon as={BsSearch} w="40px" h="40px" color="TextSecondary" />
      </Box>
      <Heading size="lg" fontWeight="800">{t.error['not found']}</Heading>
      <Text color="TextSecondary" textAlign="center" maxW="360px">
        {t.error['not found description']}
      </Text>
    </Center>
  );
}

FeaturePage.getLayout = (c) => getGuildLayout({ children: c, back: true });
export default FeaturePage;
