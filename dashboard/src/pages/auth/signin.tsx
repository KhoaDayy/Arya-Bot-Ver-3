import { Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { BsDiscord } from 'react-icons/bs';
import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getServerSession } from '@/utils/auth/server';

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;

  return (
    <Flex w="full" h="full" align="center" justify="center" p={4}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        gap={4}
        p={{ base: 8, md: 12 }}
        w="full"
        maxW="420px"
        bg="whiteAlpha.100"
        backdropFilter="blur(20px)"
        rounded="3xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="0 16px 40px rgba(0, 0, 0, 0.4)"
      >
        <Flex
          w="64px"
          h="64px"
          rounded="2xl"
          bgGradient="linear(to-br, #5865F2, #404EED)"
          align="center"
          justify="center"
          mb={2}
          shadow="0 8px 24px rgba(88, 101, 242, 0.4)"
        >
          <Icon as={BsDiscord} fontSize="3xl" color="white" />
        </Flex>

        <Heading size="lg" color="white" fontWeight="800" mt={2}>
          {t.login}
        </Heading>
        <Text color="whiteAlpha.800" fontSize="md" mb={4}>
          {t['login description']}
        </Text>

        <Button
          w="full"
          size="lg"
          h="56px"
          leftIcon={<Icon as={BsDiscord} fontSize="xl" />}
          bg="#5865F2"
          color="white"
          rounded="xl"
          fontWeight="700"
          fontSize="md"
          _hover={{
            bg: '#4752C4',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(88, 101, 242, 0.4)',
          }}
          _active={{
            bg: '#3C45A5',
            transform: 'translateY(0)',
          }}
          transition="all 0.2s"
          as="a"
          href={`/api/auth/login?locale=${locale}`}
        >
          {t.login_bn}
        </Button>
      </Flex>
    </Flex>
  );
};

LoginPage.getLayout = (c) => <AuthLayout>{c}</AuthLayout>;
export default LoginPage;

//Redirect the user back to home if they have been logged in
export const getServerSideProps: GetServerSideProps<{}> = async ({ req }) => {
  const loggedin = getServerSession(req).success;

  if (loggedin) {
    return {
      redirect: {
        destination: '/user/home',
        permanent: true,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
