import { FaDiscord, FaGamepad, FaImage, FaSearch, FaUserFriends, FaChartPie } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { config } from '@/config/common';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function HomeView() {
  const features = [
    {
      icon: FaGamepad,
      title: 'Guild War',
      description: 'Quản lý đăng ký Guild War, tự động post báo danh, ping lịch trận...',
      lightColor: 'text-red-500',
      darkColor: 'dark:text-red-400',
      lightBg: 'bg-red-50',
      darkBg: 'dark:bg-red-500/10',
      hoverBorder: 'hover:border-red-300 dark:hover:border-red-500/50',
      hoverShadow: 'hover:shadow-red-100/50 dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
    {
      icon: FaImage,
      title: 'Face Converter',
      description: 'Chuyển khuôn mặt từ phiên bản CN sang Global.',
      lightColor: 'text-blue-500',
      darkColor: 'dark:text-blue-400',
      lightBg: 'bg-blue-50',
      darkBg: 'dark:bg-blue-500/10',
      hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-500/50',
      hoverShadow: 'hover:shadow-blue-100/50 dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    {
      icon: BsStars,
      title: 'AI Chat',
      description: 'Chat AI thông minh với Arya, trả lời mọi câu hỏi trực tiếp.',
      lightColor: 'text-orange-500',
      darkColor: 'dark:text-orange-400',
      lightBg: 'bg-orange-50',
      darkBg: 'dark:bg-orange-500/10',
      hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-500/50',
      hoverShadow: 'hover:shadow-orange-100/50 dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    },
    {
      icon: FaUserFriends,
      title: 'Player Lookup',
      description: 'Tra cứu thông tin chi tiết của player WWM.',
      lightColor: 'text-purple-500',
      darkColor: 'dark:text-purple-400',
      lightBg: 'bg-purple-50',
      darkBg: 'dark:bg-purple-500/10',
      hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-500/50',
      hoverShadow: 'hover:shadow-purple-100/50 dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    },
    {
      icon: FaSearch,
      title: 'Anime Search',
      description: 'Tìm kiếm anime, xem thông tin trailer và rating.',
      lightColor: 'text-cyan-500',
      darkColor: 'dark:text-cyan-400',
      lightBg: 'bg-cyan-50',
      darkBg: 'dark:bg-cyan-500/10',
      hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-500/50',
      hoverShadow: 'hover:shadow-cyan-100/50 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    },
    {
      icon: FaChartPie,
      title: 'Dashboard',
      description: 'Quản lý toàn bộ tính năng bot qua giao diện web.',
      lightColor: 'text-pink-500',
      darkColor: 'dark:text-pink-400',
      lightBg: 'bg-pink-50',
      darkBg: 'dark:bg-pink-500/10',
      hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-500/50',
      hoverShadow: 'hover:shadow-pink-100/50 dark:hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]',
    },
  ];

  const AppIcon = config.icon;

  return (
    <motion.div
      className="w-full flex flex-col gap-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-xl group transition-colors duration-500
          bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600
          dark:from-black/60 dark:via-black/40 dark:to-black/60 dark:border dark:border-white/10 dark:shadow-2xl"
      >
        {/* Abstract glow */}
        <div className="absolute -top-[50%] -right-[10%] w-[80%] h-[200%] blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-110
          bg-gradient-to-l from-white/20 to-transparent
          dark:from-cyan-500/10 dark:via-blue-500/5 dark:to-transparent rotate-12" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative shrink-0 flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-3xl shadow-2xl overflow-hidden transition-all duration-700
              bg-white/20 backdrop-blur-sm border border-white/30
              dark:bg-black dark:border-white/20 dark:group-hover:border-cyan-500/50 dark:group-hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            {AppIcon && <AppIcon className="w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-lg" />}
          </motion.div>

          {/* Text */}
          <div className="flex-1 space-y-4 text-white">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight drop-shadow-md">
                {config.name}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-widest uppercase
                bg-white/20 border border-white/30
                dark:bg-cyan-500/20 dark:border-cyan-500/50 dark:text-cyan-400 dark:shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                v3.0
              </span>
            </div>

            <p className="text-base md:text-lg max-w-2xl font-medium leading-relaxed text-white/80 dark:text-zinc-400">
              Bot Discord đa chức năng — Tự động hóa <span className="text-white font-semibold">Guild War</span>, <span className="text-white font-semibold">AI Chat</span>, và tích hợp <span className="text-white font-semibold">Player Lookup</span> chuyên sâu.
            </p>

            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={config.inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3.5 font-bold uppercase tracking-wider text-sm rounded-xl transition-all duration-300
                bg-white text-indigo-600 hover:shadow-xl
                dark:bg-white dark:text-black dark:hover:bg-cyan-400 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            >
              <FaDiscord size={20} />
              Invite Bot
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="flex flex-col gap-6">
        <motion.div variants={item} className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full animate-pulse
              bg-orange-500 shadow-md
              dark:bg-orange-400 dark:shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <h2 className="text-lg font-black uppercase tracking-widest
              text-zinc-900 dark:text-white">Core Features</h2>
          </div>
          <p className="text-xs font-mono tracking-widest uppercase
            text-zinc-400 dark:text-zinc-500">What Arya can Do</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={item}
              whileHover={{ y: -4 }}
              className={`group flex flex-col p-6 rounded-2xl backdrop-blur-md border transition-all duration-500 cursor-default
                bg-white border-zinc-200/80 shadow-sm ${feature.hoverBorder} ${feature.hoverShadow}
                dark:bg-black/40 dark:border-white/10`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl mb-5 border border-transparent transition-colors duration-300
                  ${feature.lightBg} ${feature.lightColor} ${feature.darkBg} ${feature.darkColor}
                  group-hover:border-current/20`}
              >
                <feature.icon size={22} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-lg mb-2 transition-colors
                text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed font-medium
                text-zinc-500 dark:text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
