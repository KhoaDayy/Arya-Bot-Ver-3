import { FiSettings as SettingsIcon } from 'react-icons/fi';
import { guild as view } from '@/config/translations/guild';
import { useRouter } from 'next/router';
import Link from 'next/link';

export function Banner() {
  const { guild } = useRouter().query as { guild: string };
  const t = view.useTranslations();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0a55] via-[#2d1a9e] to-[#422AFB] bg-cover bg-center shadow-[0_8px_32px_rgba(30,10,80,0.5)]" style={{ backgroundImage: "url('/Banner1.png')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a55]/85 via-[#2d1a9e]/70 to-[#422AFB]/60 pointer-events-none" />

      {/* Decorative blobs */}
      <div className="absolute -top-[40px] -right-[40px] w-[200px] h-[200px] rounded-full bg-white/10 blur-[40px] pointer-events-none" />
      <div className="absolute -bottom-[30px] left-[30%] w-[150px] h-[150px] rounded-full bg-white/10 blur-[30px] pointer-events-none" />

      <div className="flex flex-col px-6 lg:px-10 py-6 lg:py-8 gap-2 relative z-10">
        <span className="text-xs font-bold text-white/80 tracking-widest uppercase">
          Bảng điều khiển Server
        </span>
        <h2
          className="text-white text-2xl md:text-3xl font-extrabold leading-tight shadow-black/20"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
        >
          {t.banner.title}
        </h2>
        <p className="text-white/80 text-sm max-w-[500px]">
          {t.banner.description}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/guilds/${guild}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2 text-white bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:border-white/50 hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] active:bg-white/40 active:translate-y-0 transition-all duration-200 rounded-xl font-semibold text-sm"
          >
            <SettingsIcon className="w-4 h-4" />
            {t.bn.settings}
          </Link>
        </div>
      </div>
    </div>
  );
}
