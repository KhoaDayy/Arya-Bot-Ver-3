import { GuildChannel } from '@/api/bot';
import { ChannelTypes } from '@/api/discord';
import { useMemo } from 'react';
import { useGuildChannelsQuery } from '@/api/hooks';
import { useRouter } from 'next/router';
import { ControlledInput } from './types';
import { FormCard } from './Form';
import { useController } from 'react-hook-form';
import { common } from '@/config/translations/common';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

import { BsChatLeftText } from 'react-icons/bs';
import { MdRecordVoiceOver } from 'react-icons/md';

type Props = {
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

function ChannelIcon({ channel }: { channel: GuildChannel }) {
  switch (channel.type) {
    case ChannelTypes.GUILD_STAGE_VOICE:
    case ChannelTypes.GUILD_VOICE:
      return <MdRecordVoiceOver className="w-4 h-4 text-zinc-500" />;
    default:
      return <BsChatLeftText className="w-4 h-4 text-zinc-500" />;
  }
}

export function ChannelSelect({ value, onChange, disabled }: Props) {
  const guild = useRouter().query.guild as string;
  const channelsQuery = useGuildChannelsQuery(guild);
  const isLoading = channelsQuery.isLoading;

  const { categories, roots } = useMemo(() => {
    const categories = new Map<string, GuildChannel[]>();
    const roots: GuildChannel[] = [];
    if (!channelsQuery.data) return { categories, roots };

    for (const channel of channelsQuery.data) {
      if (channel.category == null) roots.push(channel);
      else {
        const category = categories.get(channel.category);
        if (category == null) categories.set(channel.category, [channel]);
        else category.push(channel);
      }
    }
    return { categories, roots };
  }, [channelsQuery.data]);

  return (
    <Select disabled={disabled || isLoading} value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 h-11 rounded-xl shadow-none">
        <SelectValue placeholder={<common.T text="select channel" />} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {roots.map(channel => {
          if (channel.type === ChannelTypes.GUILD_CATEGORY) {
            const children = categories.get(channel.id) ?? [];
            return (
              <SelectGroup key={channel.id}>
                <SelectLabel className="bg-zinc-100 dark:bg-zinc-800/50 text-xs font-bold uppercase tracking-wider">{channel.name}</SelectLabel>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id} className="pl-6">
                    <div className="flex items-center gap-2">
                      <ChannelIcon channel={child} />
                      <span>{child.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          }
          return (
            <SelectItem key={channel.id} value={channel.id}>
              <div className="flex items-center gap-2">
                <ChannelIcon channel={channel} />
                <span>{channel.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export const ChannelSelectForm: ControlledInput<Omit<Props, 'value' | 'onChange'>> = ({
  control,
  controller,
  ...props
}) => {
  const { field, fieldState } = useController(controller);

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <ChannelSelect value={field.value} onChange={field.onChange} {...props} />
    </FormCard>
  );
};
