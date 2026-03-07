import { ReactNode } from 'react';

import { UserMenu } from '@/components/menu/UserMenu';
import { SidebarTrigger } from '@/components/SidebarTrigger';
import { ThemeSwitch } from '@/components/ThemeSwitch';

export function Navbar({ links, children }: { links?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-row mx-auto bg-zinc-50/20 dark:bg-[#08081c]/50 backdrop-blur-xl rounded-none xl:rounded-2xl leading-[25.6px] px-6 xl:px-5 py-1 xl:py-2 gap-2 justify-between items-stretch transition-colors">
      {children}
      <NavbarLinksBox>{links}</NavbarLinksBox>
    </div>
  );
}

function NavbarLinksBox({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-end items-center flex-row bg-white dark:bg-[#111] p-2.5 rounded-full shadow-sm border border-zinc-200 dark:border-white/5 gap-2">
      {children ?? (
        <>
          <SidebarTrigger />
          <ThemeSwitch />
          <UserMenu />
        </>
      )}
    </div>
  );
}
