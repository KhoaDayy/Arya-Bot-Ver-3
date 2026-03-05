// Chakra imports
import { Box, HStack, Spacer, Text } from '@chakra-ui/react';
import { config } from '@/config/common';
import { ReactNode } from 'react';
import { SelectField } from '../forms/SelectField';
import { languages, names, useLang } from '@/config/translations/provider';
import { common } from '@/config/translations/common';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      w="full"
      h="100vh"
      overflow="hidden"
      position="relative"
      bg="linear-gradient(135deg, #0b0725 0%, #150942 50%, #18092a 100%)"
    >
      {/* Decorative glows inspired by Stitch output */}
      <Box
        position="absolute"
        top="-10%"
        left="-5%"
        w="500px"
        h="500px"
        rounded="full"
        bg="purple.500"
        opacity={0.15}
        filter="blur(100px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="400px"
        h="400px"
        rounded="full"
        bg="brand.500"
        opacity={0.15}
        filter="blur(120px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        top="40%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        rounded="full"
        bg="#422AFB"
        opacity={0.08}
        filter="blur(150px)"
        pointerEvents="none"
      />

      {/* Header bar */}
      <HStack
        pos="fixed"
        top={0}
        left={0}
        w="full"
        zIndex={10}
        px={{ base: 5, lg: 10 }}
        py={4}
        bg="transparent"
      >
        <HStack gap={3}>
          {config.icon?.({ w: 8, h: 8 })}
          <Text fontWeight="800" fontSize="xl" color="white" letterSpacing="tight">
            {config.name}
          </Text>
        </HStack>
        <Spacer />
        <Box w="140px">
          <LanguageSelect />
        </Box>
      </HStack>

      {/* Page Content */}
      <Box w="full" h="full" pos="relative" zIndex={1} overflow="auto">
        {children}
      </Box>
    </Box>
  );
}

function LanguageSelect() {
  const { lang, setLang } = useLang();
  const t = common.useTranslations();

  return (
    <SelectField
      id="lang"
      value={{
        label: names[lang],
        value: lang,
      }}
      onChange={(e) => e != null && setLang(e.value)}
      options={languages.map(({ name, key }) => ({
        label: name,
        value: key,
      }))}
      placeholder={t['select lang']}
    />
  );
}
