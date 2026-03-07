import { ReactNode } from 'react';
import { languages, names, useLang } from '@/config/translations/provider';
import { common } from '@/config/translations/common';
import { config } from '@/config/common';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-white/30 font-sans">
      {/* Animated Moving Cyber-Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b1b_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80 pointer-events-none animate-grid-move"
        style={{ height: '200%', top: '-100%' }}
      ></div>

      {/* Animated Radar Scanning Line */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent w-full h-[150%] animate-grid-scan pointer-events-none opacity-50 mix-blend-screen"></div>

      {/* Header bar */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 lg:px-12 py-6 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center">
            {config.icon?.({ w: 5, h: 5, color: "black" }) || <div className="w-4 h-4 bg-black"></div>}
          </div>
          <span className="font-extrabold text-xl tracking-tighter text-white uppercase">
            {config.name}
          </span>
        </div>

        <div>
          <LanguageSelect />
        </div>
      </header>

      {/* Page Content */}
      <main className="relative z-10 w-full h-full min-h-screen pt-24 pb-12">
        {children}
      </main>
    </div>
  );
}

function LanguageSelect() {
  const { lang, setLang } = useLang();
  const t = common.useTranslations();

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as any)}>
      <SelectTrigger className="w-[140px] bg-black border-white/20 text-white shadow-none focus:ring-0">
        <SelectValue placeholder={t['select lang']} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-950 border-white/10 text-white">
        {languages.map(({ name, key }) => (
          <SelectItem key={key} value={key} className="focus:bg-white/10 focus:text-white">
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
