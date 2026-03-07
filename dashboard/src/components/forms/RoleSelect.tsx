import { useGuildRolesQuery } from '@/api/hooks';
import { toRGB } from '@/utils/common';
import { Role } from '@/api/bot';
import { useRouter } from 'next/router';
import { Params } from '@/pages/guilds/[guild]/features/[feature]';
import { ControlledInput } from './types';
import { FormCard } from './Form';
import { useController } from 'react-hook-form';
import { common } from '@/config/translations/common';
import { BsPeopleFill } from 'react-icons/bs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  value?: string;
  onChange: (role: string) => void;
  disabled?: boolean;
};

function RoleIcon({ role }: { role: Role }) {
  if (role.icon?.iconUrl != null) {
    return <img alt="icon" src={role.icon.iconUrl} style={{ backgroundColor: toRGB(role.color) }} className="w-5 h-5 rounded-full" />;
  }
  return <BsPeopleFill style={{ color: toRGB(role.color) }} className="w-4 h-4" />;
}

export function RoleSelect({ value, onChange, disabled }: Props) {
  const { guild } = useRouter().query as Params;
  const rolesQuery = useGuildRolesQuery(guild);
  const isLoading = rolesQuery.isLoading;

  return (
    <Select disabled={disabled || isLoading} value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 h-11 rounded-xl shadow-none">
        <SelectValue placeholder={<common.T text="select role" />} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {rolesQuery.data?.map(role => (
          <SelectItem key={role.id} value={role.id}>
            <div className="flex items-center gap-2">
              <RoleIcon role={role} />
              <span className="font-medium">{role.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const RoleSelectForm: ControlledInput<Omit<Props, 'value' | 'onChange'>> = ({
  control,
  controller,
  ...props
}) => {
  const { fieldState, field } = useController(controller);

  return (
    <FormCard {...control} error={fieldState?.error?.message}>
      <RoleSelect value={field.value} onChange={field.onChange} {...props} />
    </FormCard>
  );
};
