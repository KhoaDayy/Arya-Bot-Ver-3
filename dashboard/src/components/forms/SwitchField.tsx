import { ReactNode } from 'react';
import { useController } from 'react-hook-form';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { Form } from './Form';
import { ControlledInput } from './types';

export const SwitchFieldForm: ControlledInput<{}, boolean> = ({
  control,
  controller,
  ...props
}) => {
  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useController(controller);

  return (
    <Form isRequired={control.required} isInvalid={fieldState.invalid} {...(control.baseControl as any)}>
      <div className="flex justify-between items-center rounded-2xl gap-3">
        <div>
          <label className="text-base md:text-lg font-medium mb-0 text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
            {control.label}
            {control.required && <span className="text-red-500">*</span>}
          </label>
          <div className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-1">
            {control.description}
          </div>
        </div>
        <ShadcnSwitch
          checked={value}
          onCheckedChange={onChange}
          {...(field as any)}
          {...props}
        />
      </div>
      {fieldState.error?.message && <span className="text-red-500 text-sm mt-2">{fieldState.error.message}</span>}
    </Form>
  );
};

export function SwitchField(
  props: {
    id?: string;
    label?: ReactNode;
    desc?: ReactNode;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
) {
  const { id, label, desc, checked, onCheckedChange, ...rest } = props;

  return (
    <div className="flex justify-between items-center rounded-2xl gap-6">
      <div>
        <label htmlFor={id} className="text-base font-medium mb-0 text-zinc-900 dark:text-zinc-100">
          {label}
        </label>
        <div className="text-zinc-500 dark:text-zinc-400 mt-1">{desc}</div>
      </div>
      <ShadcnSwitch id={id} checked={checked} onCheckedChange={onCheckedChange} {...(rest as any)} />
    </div>
  );
}
