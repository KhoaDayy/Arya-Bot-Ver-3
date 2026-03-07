import { LoadingPanel } from '@/components/panel/LoadingPanel';
import { features } from '@/config/features';
import { CustomFeatures, FeatureConfig } from '@/config/types';
import { BsSearch, BsToggleOn } from 'react-icons/bs';
import { useEnableFeatureMutation, useFeatureQuery } from '@/api/hooks';
import { UpdateFeaturePanel } from '@/components/feature/UpdateFeaturePanel';
import { feature as view } from '@/config/translations/feature';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';

export type Params = {
  guild: string;
  feature: keyof CustomFeatures;
};

export type UpdateFeatureValue<K extends keyof CustomFeatures> = Partial<CustomFeatures[K]>;

const FeaturePage: NextPageWithLayout = () => {
  const { feature, guild } = useRouter().query as Params;

  const query = useFeatureQuery(guild, feature);
  const featureConfig = features[feature] as FeatureConfig<typeof feature>;
  const skeleton = featureConfig?.useSkeleton?.();

  if (!guild || !feature) return <LoadingPanel />;
  if (featureConfig == null) return <NotFound />;
  if (query.isError) return <NotEnabled />;
  if (query.isLoading) return skeleton != null ? <>{skeleton}</> : <LoadingPanel />;
  return <UpdateFeaturePanel key={feature} feature={query.data} config={featureConfig} />;
};

function NotEnabled() {
  const t = view.useTranslations();
  const { guild, feature } = useRouter().query as Params;
  const enable = useEnableFeatureMutation();
  const featureConfig = features[feature];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] gap-0 py-10 px-4">
      <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 max-w-[420px] w-full text-center shadow-xl relative overflow-hidden group">
        {/* Decorative ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-500" />

        {/* Feature icon */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-3xl mx-auto mb-5 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)] text-indigo-500 dark:text-indigo-400">
          {featureConfig?.icon}
        </div>

        <span className="relative z-10 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 animate-pulse" />
          Chưa Bật Tính Năng
        </span>

        <h2 className="relative z-10 text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
          {featureConfig?.name}
        </h2>

        <p className="relative z-10 text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">
          {t.error['not enabled']}
        </p>
        <p className="relative z-10 text-sm text-zinc-500 dark:text-zinc-500 mb-8 px-2 leading-relaxed">
          {t.error['not enabled description']}
        </p>

        <button
          disabled={enable.isLoading}
          onClick={() => enable.mutate({ enabled: true, guild, feature })}
          className="relative z-10 w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0"
        >
          {enable.isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <BsToggleOn className="w-6 h-6" />
          )}
          BẬT NGAY BÂY GIỜ
        </button>
      </div>
    </div>
  );
}

function NotFound() {
  const t = view.useTranslations();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] gap-4 py-20 px-4">
      <div className="p-6 rounded-full bg-zinc-100 dark:bg-white/5 mb-2 relative">
        <BsSearch className="w-12 h-12 text-zinc-400 dark:text-zinc-500 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mt-12">{t.error['not found']}</h2>
      <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-[360px] leading-relaxed">
        {t.error['not found description']}
      </p>
    </div>
  );
}

FeaturePage.getLayout = (c) => getGuildLayout({ children: c, back: true });
export default FeaturePage;
