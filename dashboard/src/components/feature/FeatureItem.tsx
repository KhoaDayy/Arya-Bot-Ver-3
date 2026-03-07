import { IdFeature } from '@/utils/common';
import { IoOptions } from 'react-icons/io5';
import { BsToggleOn } from 'react-icons/bs';
import { useEnableFeatureMutation } from '@/api/hooks';
import { guild as view } from '@/config/translations/guild';
import Router from 'next/router';

export function FeatureItem({
  guild,
  feature,
  enabled,
}: {
  guild: string;
  feature: IdFeature;
  enabled: boolean;
}) {
  const t = view.useTranslations();
  const mutation = useEnableFeatureMutation();

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 bg-white dark:bg-zinc-800 ${enabled
          ? 'border-indigo-400 dark:border-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 hover:shadow-lg'
          : 'border-zinc-200 dark:border-white/10 hover:-translate-y-0.5 hover:shadow-lg'
        }`}
    >
      {/* Card Body */}
      <div className="flex flex-row items-start gap-4 p-5">
        <div
          className={`flex items-center justify-center shrink-0 w-12 h-12 rounded-xl text-xl ${enabled
              ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
              : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-400 dark:text-indigo-200'
            }`}
        >
          {feature.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-[15px] md:text-base font-bold truncate text-zinc-900 dark:text-white">
              {feature.name}
            </p>
            {enabled ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ● Đang bật
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                Chưa bật
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {feature.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex justify-end px-5 pb-4 pt-3 border-t border-zinc-100 dark:border-white/5">
        <button
          disabled={mutation.isLoading}
          onClick={() => {
            if (enabled) {
              Router.push(`/guilds/${guild}/features/${feature.id}`);
            } else {
              mutation.mutate({ enabled: true, guild, feature: feature.id });
            }
          }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${enabled
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              : 'border border-indigo-200 hover:border-indigo-400 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10'
            }`}
        >
          {enabled ? (
            <>
              <IoOptions size={16} />
              <span>{t.bn['config feature']}</span>
            </>
          ) : (
            <>
              <BsToggleOn size={16} />
              <span>{t.bn['enable feature']}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
