import { RiErrorWarningFill as WarningIcon } from 'react-icons/ri';
import { FeatureConfig, UseFormRenderResult, CustomFeatures } from '@/config/types';
import { IoSave } from 'react-icons/io5';
import { MdOutlineToggleOff } from 'react-icons/md';
import { useEnableFeatureMutation, useUpdateFeatureMutation } from '@/api/hooks';
import { Params } from '@/pages/guilds/[guild]/features/[feature]';
import { feature as view } from '@/config/translations/feature';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';

export function UpdateFeaturePanel({
  feature,
  config,
}: {
  feature: CustomFeatures[keyof CustomFeatures];
  config: FeatureConfig<keyof CustomFeatures>;
}) {
  const { guild, feature: featureId } = useRouter().query as Params;
  const mutation = useUpdateFeatureMutation();
  const enableMutation = useEnableFeatureMutation();
  const result = config.useRender(feature, (data) => {
    return mutation.mutateAsync({
      guild,
      feature: featureId,
      options: data,
    });
  });

  const onDisable = () => {
    enableMutation.mutate({ enabled: false, guild, feature: featureId });
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <form onSubmit={result.onSubmit} className="flex flex-col gap-6 w-full h-full relative pb-24">
      {/* ── Feature Hero Header ── */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 p-6 md:p-8 shadow-sm group">
        {/* Decorative accent */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-150" />
        <div className="absolute -bottom-6 left-[40%] w-32 h-32 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl pointer-events-none transition-all duration-700 group-hover:-translate-y-4" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 relative z-10">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 flex items-center justify-center text-2xl md:text-3xl text-white flex-shrink-0 shadow-[0_4px_20px_rgba(99,102,241,0.4)]">
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white truncate">
                {config.name}
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                Đang bật
              </span>
            </div>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">
              {config.description}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            disabled={enableMutation.isLoading}
            onClick={onDisable}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mt-4 md:mt-0"
          >
            {enableMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdOutlineToggleOff className="w-5 h-5" />
            )}
            <view.T text={(e) => e.bn.disable} />
          </motion.button>
        </div>
      </div>

      {/* ── Form Content ── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex-1 flex flex-col gap-6">
        {result.component}
      </motion.div>

      {/* ── Savebar ── */}
      <Savebar isLoading={mutation.isLoading} result={result} />
    </form>
  );
}

function Savebar({
  result: { canSave, onSubmit, reset },
  isLoading,
}: {
  result: UseFormRenderResult;
  isLoading: boolean;
}) {
  const t = view.useTranslations();

  return (
    <AnimatePresence>
      {canSave && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-3xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border border-indigo-500/30 dark:border-indigo-500/40 shadow-[0_8px_32px_rgba(99,102,241,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-500">
                <WarningIcon className="w-5 h-5" />
              </div>
              <p className="text-sm md:text-base font-bold text-zinc-900 dark:text-white truncate">
                {t.unsaved}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={isLoading}
                onClick={reset}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {t.bn.discard}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={isLoading}
                onClick={onSubmit}
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <IoSave className="w-4 h-4" />
                )}
                {t.bn.save}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
