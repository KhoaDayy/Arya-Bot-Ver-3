import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import { BsGearFill } from 'react-icons/bs';
import Link from 'next/link';

const GuildSettingsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const guild = router.query.guild as string;

  if (!guild) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="ml-0 xl:ml-5">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Cài đặt chung (General)
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm max-w-2xl">
          Mục cài đặt chung của Server hiện không có thông số nào cần tinh chỉnh. Bạn hãy quay lại trang Guild Home để tùy chỉnh các tính năng riêng biệt nhé.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <BsGearFill className="w-20 h-20 text-zinc-400 dark:text-zinc-600" />
        <span className="text-lg text-zinc-500 dark:text-zinc-400">Chưa hỗ trợ cài đặt ở trang này</span>
        <Link
          href={`/guilds/${guild}`}
          className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
        >
          Quay về trang quản lý Tính Năng
        </Link>
      </div>
    </div>
  );
};

GuildSettingsPage.getLayout = (c) => getGuildLayout({ children: c, back: true });
export default GuildSettingsPage;
