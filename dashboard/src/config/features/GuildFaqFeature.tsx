import { CustomFeatures } from '@/config/types';
import { UseFormRender } from '@/config/types';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { useGuildChannelsQuery } from '@/api/hooks';
import { SectionCard, FieldLabel } from './guild-war/SharedComponents';
import { ChannelSelect } from '@/components/forms/ChannelSelect';
import { Switch } from '@/components/ui/switch';
import { BsChatLeftText, BsInfoCircle, BsSearch } from 'react-icons/bs';

/* eslint-disable react-hooks/exhaustive-deps */

const DEFAULT_KEYWORDS = [
  'guild',
  'bang hội',
  'club',
  'hoạt động guild',
  'content guild',
];

const DEFAULT_EMBED = {
  title: 'Sau 21h30 – Party Guild',
  description:
    'Chỉ cần vào treo trong guild cùng mọi người là được.\n' +
    'Sẽ nhận điểm cống hiến guild và xu / phần thưởng khác.\n\n' +
    '**Các hoạt động khác của Guild:**\n' +
    '1. **Breaking Army**\n' +
    'Thời gian: 17h Thứ 7 & Chủ Nhật\n' +
    'Hình thức: solo đánh boss\n' +
    'Chỉ cần đánh qua được boss là nhận quà và điểm cửa hàng guild.\n\n' +
    '2. **Guild War**\n' +
    'Thời gian: 19h30 Thứ 7 & Chủ Nhật\n' +
    'Hình thức: 30 người guild mình vs 30 người guild khác\n' +
    'Thường phải vào Discord để nghe call chiến thuật, chia đường giống game MOBA.\n' +
    'Cũng nhận điểm cửa hàng guild.\n\n' +
    '3. **Solo PvP**\n' +
    'Thời gian: 22h Thứ 7 & Chủ Nhật\n' +
    'Đấu PvP với thành viên trong guild.\n\n' +
    '4. **Guild Boss**\n' +
    'Giống boss tuần, đánh boss nhận quà và điểm cửa hàng guild.',
  color: '#A855F7',
  footer: 'Hỏi thêm tại Discord nếu cần hỗ trợ.',
  thumbnailUrl: '',
};

const parseKeywords = (value?: string[]) => {
  if (!value || value.length === 0) return DEFAULT_KEYWORDS;
  return value;
};

const joinKeywords = (value?: string[]) => parseKeywords(value).join('\n');

const parseKeywordText = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const useGuildFaqFeature: UseFormRender<CustomFeatures['guild-faq']> = (data, submit) => {
  const router = useRouter();
  const guildId = router.query.guild as string;
  const channels = useGuildChannelsQuery(guildId);

  const mergedDefaults: CustomFeatures['guild-faq'] = {
    ...data,
    channelId: data?.channelId ?? '',
    isActive: data?.isActive ?? true,
    keywords: parseKeywords(data?.keywords),
    embed: {
      title: data?.embed?.title ?? DEFAULT_EMBED.title,
      description: data?.embed?.description ?? DEFAULT_EMBED.description,
      color: data?.embed?.color ?? DEFAULT_EMBED.color,
      footer: data?.embed?.footer ?? DEFAULT_EMBED.footer,
      thumbnailUrl: data?.embed?.thumbnailUrl ?? DEFAULT_EMBED.thumbnailUrl,
    },
  };

  const form = useForm<CustomFeatures['guild-faq']>({
    defaultValues: mergedDefaults,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    form.reset(mergedDefaults);
  }, [data]);

  const savedRef = useRef(JSON.stringify(mergedDefaults));
  useEffect(() => {
    savedRef.current = JSON.stringify(mergedDefaults);
  }, [data]);

  const watchedValues = form.watch();
  const hasChanges = JSON.stringify(watchedValues) !== savedRef.current;

  const onSubmit = form.handleSubmit(async (values) => {
    const embed = { ...(values.embed || {}) } as Record<string, string | undefined>;
    Object.keys(embed).forEach((key) => {
      if (embed[key] === '') embed[key] = undefined;
    });

    const payload = {
      ...values,
      keywords: parseKeywords(values.keywords),
      embed,
    };

    await submit(JSON.stringify(payload));
    savedRef.current = JSON.stringify(form.getValues());
  });

  return {
    onSubmit,
    canSave: hasChanges,
    reset() {
      form.reset(mergedDefaults);
      savedRef.current = JSON.stringify(mergedDefaults);
    },
    component: (
      <div className="flex flex-col gap-5 w-full" id="guild-faq-form">
        <SectionCard
          icon={BsChatLeftText}
          iconColor="purple"
          title="Kênh Trả Lời"
          description="Chọn kênh và bật/tắt auto-response FAQ"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Kênh trả lời FAQ</FieldLabel>
              <Controller
                name="channelId"
                control={form.control}
                render={({ field }) => (
                  <ChannelSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={channels.isLoading}
                  />
                )}
              />
              <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                Bot sẽ phản hồi FAQ trong kênh này.
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <FieldLabel>Bật FAQ</FieldLabel>
              <div className="flex items-center gap-4 bg-zinc-100 dark:bg-white/5 border border-transparent rounded-xl px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Kích hoạt trả lời tự động</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Tắt nếu muốn ngưng phản hồi FAQ.</p>
                </div>
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="guild-faq-active"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={BsSearch}
          iconColor="blue"
          title="Từ Khóa"
          description="Cài các từ khóa để bot nhận biết câu hỏi"
        >
          <div>
            <FieldLabel>Từ khóa</FieldLabel>
            <Controller
              name="keywords"
              control={form.control}
              render={({ field }) => (
                <textarea
                  value={joinKeywords(field.value)}
                  onChange={(e) => field.onChange(parseKeywordText(e.target.value))}
                  rows={4}
                  placeholder={DEFAULT_KEYWORDS.join('\n')}
                  className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all resize-none"
                />
              )}
            />
            <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
              Mỗi dòng là một từ khóa. Bot sẽ phản hồi nếu câu hỏi chứa các từ này.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          icon={BsInfoCircle}
          iconColor="green"
          title="Nội Dung Embed"
          description="Tuỳ chỉnh nội dung embed trả lời"
        >
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Tiêu đề</FieldLabel>
              <Controller
                name="embed.title"
                control={form.control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value ?? ''}
                    placeholder={DEFAULT_EMBED.title}
                    className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                  />
                )}
              />
            </div>

            <div>
              <FieldLabel>Mô tả</FieldLabel>
              <Controller
                name="embed.description"
                control={form.control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    value={field.value ?? ''}
                    rows={7}
                    className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all resize-none"
                  />
                )}
              />
              <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-400">
                Hỗ trợ **bold** và xuống dòng bằng Enter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Màu Accent</FieldLabel>
                <Controller
                  name="embed.color"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex w-full items-center p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus-within:bg-white dark:focus-within:bg-[#111] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                      <div
                        className="relative w-10 h-9 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/20 flex-shrink-0 cursor-pointer"
                        style={{ backgroundColor: field.value || DEFAULT_EMBED.color }}
                      >
                        <input
                          type="color"
                          value={field.value || DEFAULT_EMBED.color}
                          onChange={field.onChange}
                          className="absolute -inset-4 w-20 h-20 opacity-0 cursor-pointer"
                        />
                      </div>
                      <input
                        {...field}
                        placeholder={DEFAULT_EMBED.color}
                        className="flex-1 min-w-0 h-full px-3 bg-transparent border-none focus:ring-0 text-sm text-zinc-900 dark:text-white uppercase outline-none"
                        value={field.value || ''}
                      />
                    </div>
                  )}
                />
              </div>

              <div>
                <FieldLabel>Thumbnail URL</FieldLabel>
                <Controller
                  name="embed.thumbnailUrl"
                  control={form.control}
                  render={({ field }) => (
                    <input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="https://..."
                      className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <FieldLabel>Footer</FieldLabel>
              <Controller
                name="embed.footer"
                control={form.control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value ?? ''}
                    placeholder={DEFAULT_EMBED.footer}
                    className="w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white text-sm transition-all"
                  />
                )}
              />
            </div>
          </div>
        </SectionCard>
      </div>
    ),
  };
};
