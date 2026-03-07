import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getServerSession } from '@/utils/auth/server';
import { BsDiscord, BsArrowRight, BsTerminal } from 'react-icons/bs';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import React, { useEffect, useState, MouseEvent } from 'react';

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;

  // Global mouse tracking spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Typewriter effect state
  const bootSequenceText = "> INIT SECURE HANDSHAKE... [OK]\n> ESTABLISHING WSS CONNECTION... [OK]\n> VERIFYING ENCRYPTION KEYS... [OK]\n> AWAITING USER AUTHORIZATION...";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= bootSequenceText.length) {
        setDisplayText(bootSequenceText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 40); // typing speed
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col justify-center relative">
      {/* Interactive Fullscreen Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 transition duration-500 mix-blend-screen"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              700px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.08),
              transparent 80%
            )
          `,
        }}
      />

      <div className="w-full max-w-7xl mx-auto px-6 h-[calc(100vh-120px)] flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full">

          {/* Left side: Massive Typography */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.2 }
              }
            }}
            className="flex flex-col space-y-8"
          >
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="inline-flex items-center gap-3">
              <span className="w-12 h-0.5 bg-white"></span>
              <span className="text-sm font-bold tracking-[0.2em] text-zinc-400 uppercase flex items-center gap-2">
                System Authorization
                <span className="inline-block animate-wave origin-[70%_70%] text-xl">👋</span>
              </span>
            </motion.div>

            <h1 className="text-6xl sm:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] text-white">
              <motion.span variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} className="block">COMMAND</motion.span>
              <motion.span variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} className="text-zinc-600 block mt-2">THE CHAOS.</motion.span>
            </h1>

            <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-lg md:text-xl text-zinc-400 max-w-md font-medium leading-relaxed">
              {t['login description'] || "Authenticate via Discord to gain administrative access to your server operations and deployment metrics."}
            </motion.p>

            {/* System Metrics Terminal */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mt-8 border border-white/10 bg-white/[0.02] p-6 max-w-md font-mono text-xs uppercase tracking-widest text-zinc-500 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-1">
                <span className="text-zinc-300 font-bold">Live Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="flex justify-between">
                <span>Node SEC_01</span>
                <span className="text-zinc-300">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>Latency</span>
                <span className="text-zinc-300">14ms</span>
              </div>
              <div className="flex justify-between">
                <span>Encryption</span>
                <span className="text-zinc-300">AES-256</span>
              </div>
              <div className="mt-2 pt-3 border-t border-white/10 text-cyan-400 font-mono flex flex-col items-start text-left whitespace-pre-wrap drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                <span>{displayText}<span className="w-1.5 h-3 bg-cyan-400 animate-pulse inline-block align-middle ml-1 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span></span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side: Brutalist Login Pane */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end animate-float"
          >
            <div className="w-full max-w-[440px] bg-black/40 backdrop-blur-2xl border border-white/10 p-10 flex flex-col items-center text-center space-y-10 relative overflow-hidden group shadow-[0_0_50px_rgba(59,130,246,0.15)] rounded-sm">

              {/* Subtle hover effect on the box */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              {/* Logo box */}
              <div className="w-20 h-20 bg-white flex items-center justify-center shrink-0">
                <BsDiscord className="text-black text-4xl" />
              </div>

              <div className="space-y-4 relative z-10 w-full">
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase">{t.login || "AUTHENTICATE"}</h2>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>

              <a
                href={`/api/auth/login?locale=${locale}`}
                className="relative z-10 w-full group/btn block mt-4"
              >
                {/* Shadow Layer for Brutalist Button */}
                <div className="absolute inset-0 bg-white translate-y-1.5 translate-x-1.5 border border-white/20 transition-transform duration-300 group-hover/btn:translate-x-0 group-hover/btn:translate-y-0"></div>

                {/* Main Button */}
                <div className="relative w-full h-16 bg-black border border-white flex items-center justify-between px-6 transition-all duration-300 group-hover/btn:-translate-y-1 group-hover/btn:-translate-x-1 active:translate-x-1 active:translate-y-1 group-hover/btn:shadow-neon-blue group-hover/btn:border-blue-500">
                  <div className="flex items-center gap-4">
                    <BsDiscord className="text-white text-2xl group-hover/btn:scale-110 group-hover/btn:text-blue-400 transition-all drop-shadow-[0_0_8px_rgba(59,130,246,0)] group-hover/btn:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                    <span className="text-white font-bold tracking-widest text-sm uppercase group-hover/btn:text-blue-100 transition-colors">{t.login_bn || "CONTINUE WITH DISCORD"}</span>
                  </div>
                  <BsArrowRight className="text-white text-xl opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                </div>
              </a>

              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-8 font-medium">
                Secure Auth v3.0
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
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
