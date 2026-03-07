import { FaChevronLeft as ChevronLeftIcon, FaUsers } from 'react-icons/fa';
import { HSeparator } from '@/components/layout/Separator';
import { getFeatures } from '@/utils/common';
import { IoSettings } from 'react-icons/io5';
import { BsFillTrophyFill } from 'react-icons/bs';
import { useGuildPreview } from '@/api/hooks';
import { guild as view } from '@/config/translations/guild';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Params } from '@/pages/guilds/[guild]/features/[feature]';
import { SidebarItem } from '../sidebar/SidebarItem';

export function InGuildSidebar() {
  const router = useRouter();
  const { guild: guildId, feature: activeId } = router.query as Params;
  const { guild } = useGuildPreview(guildId);

  const t = view.useTranslations();

  return (
    <div className="flex flex-col gap-2 p-3">
      <Link href={`/guilds/${guildId}`} className="flex items-center gap-2 mb-2 group px-2">
        <button className="hidden xl:flex items-center p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {guild?.name}
        </span>
      </Link>
      <div className="flex flex-col items-stretch gap-1">
        <SidebarItem
          href={`/guilds/${guildId}/settings`}
          active={router.route === `/guilds/[guild]/settings`}
          icon={<IoSettings className="w-5 h-5" />}
          name={t.bn.settings}
        />
        <SidebarItem
          href={`/guilds/${guildId}/gw-members`}
          active={router.route === `/guilds/[guild]/gw-members`}
          icon={<FaUsers className="w-5 h-5" />}
          name="Guild War Members"
        />
        <SidebarItem
          href={`/guilds/${guildId}/club-activity`}
          active={router.route === `/guilds/[guild]/club-activity`}
          icon={<BsFillTrophyFill className="w-5 h-5" />}
          name="Cống Hiến Bang"
        />
        <HSeparator>Features</HSeparator>
        {getFeatures().map((feature) => (
          <SidebarItem
            key={feature.id}
            name={feature.name}
            icon={feature.icon as any}
            active={activeId === feature.id}
            href={`/guilds/${guildId}/features/${feature.id}`}
          />
        ))}
      </div>
    </div>
  );
}
