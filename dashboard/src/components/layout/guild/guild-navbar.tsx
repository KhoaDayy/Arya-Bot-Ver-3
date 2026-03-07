import { FaChevronLeft as ChevronLeftIcon } from 'react-icons/fa';
import { iconUrl } from '@/api/discord';
import { useGuildPreview } from '@/api/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function GuildNavbar({ back }: { back?: boolean }) {
  const { guild: selected } = useRouter().query as { guild: string };
  const { guild } = useGuildPreview(selected);

  return (
    <div className="flex w-full flex-row items-center gap-3">
      <AnimatePresence initial={false}>
        {back && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <Link
              href={`/guilds/${selected}`}
              className="flex xl:hidden pr-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ChevronLeftIcon className="my-auto text-lg" aria-label="back" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {guild == null ? (
        <Skeleton className="w-10 h-10 rounded-full" />
      ) : (
        <Avatar className="hidden xl:flex w-10 h-10">
          <AvatarImage src={iconUrl(guild)} alt={guild.name} />
          <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">{guild.name?.substring(0, 2)}</AvatarFallback>
        </Avatar>
      )}
      <span className="font-semibold text-lg text-ellipsis whitespace-nowrap w-0 flex-1 overflow-hidden text-zinc-900 dark:text-zinc-100">
        {guild?.name}
      </span>
    </div>
  );
}
