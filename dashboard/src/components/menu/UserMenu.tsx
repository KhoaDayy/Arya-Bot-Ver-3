import { UserInfo, avatarUrl } from '@/api/discord';
import { common } from '@/config/translations/common';
import Link from 'next/link';
import { useSelfUser } from '@/api/hooks';
import { useLogoutMutation } from '@/utils/auth/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserMenu() {
  const user = useSelfUser();
  const logout = useLogoutMutation();
  const t = common.useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none ring-offset-2 ring-offset-zinc-50 dark:ring-offset-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-indigo-500">
          <Avatar className="w-10 h-10 cursor-pointer">
            <AvatarImage src={avatarUrl(user)} alt={user.username} />
            <AvatarFallback className="bg-indigo-900 text-white">{user.username.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="flex w-full mb-1">
          <div className="px-3 pt-2 pb-3 w-full border-b border-zinc-100 dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <span aria-label="Hi" role="img">👋</span>
            &nbsp; Chào, {user.username}
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-zinc-100 dark:focus:bg-white/10">
            <Link href={`/user/profile`}>
              <span className="text-sm font-medium">{t.profile}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-xl px-3 py-2 cursor-pointer transition-colors text-red-500 focus:text-red-500 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-500/10"
            onClick={() => logout.mutate()}
          >
            <span className="text-sm font-medium">{t.logout}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
