import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful';
import { ColorPickerBaseProps } from 'react-colorful/dist/types';
import { FormCard } from './Form';
import { convertHexToRGBA } from '@/utils/common';
import { useController } from 'react-hook-form';
import { ControlledInput } from './types';

export type ColorPickerFormProps = Omit<ColorPickerProps, 'value' | 'onChange'>;

export const SmallColorPickerForm: ControlledInput<
  ColorPickerFormProps,
  ColorPickerProps['value']
> = ({ control, controller, ...props }) => {
  const { field, fieldState } = useController(controller);
  const { value } = field;

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative flex w-full cursor-pointer group">
            <div
              className="absolute left-0 top-0 bottom-0 w-12 rounded-l-xl border border-r-0 border-zinc-200 dark:border-white/10"
              style={{ backgroundColor: value || 'transparent' }}
            />
            <Input
              autoComplete="off"
              className="pl-14 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 rounded-xl cursor-pointer"
              placeholder={value ?? 'Chọn màu'}
              {...field}
              value={field.value ?? ''}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="start">
          <ColorPicker value={value} onChange={field.onChange} {...props} />
        </PopoverContent>
      </Popover>
    </FormCard>
  );
};

export const ColorPickerForm: ControlledInput<ColorPickerFormProps, ColorPickerProps['value']> = ({
  control,
  controller,
  ...props
}) => {
  const { field, fieldState } = useController(controller);
  const { value } = field;

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <div
            className="hidden md:flex min-h-[150px] rounded-xl border border-zinc-200 dark:border-white/10 items-center justify-center flex-1 transition-colors"
            style={{ backgroundColor: value == null ? 'var(--input-bg)' : convertHexToRGBA(value) }}
          >
            {value == null && (
              <span className="text-sm text-zinc-500">
                No Color
              </span>
            )}
          </div>
          <Input
            placeholder={value ?? 'Chọn màu'}
            className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 rounded-xl"
            autoComplete="off"
            {...field}
            value={field.value ?? ''}
          />
        </div>
        <div>
          <ColorPicker value={field.value} onChange={field.onChange} {...props} />
        </div>
      </div>
    </FormCard>
  );
};

export type ColorPickerProps = {
  value?: string | null;
  onChange?: (color: string) => void;
  supportAlpha?: boolean;
};

export function ColorPicker({ value, onChange, supportAlpha, ...rest }: ColorPickerProps) {
  const props: Partial<ColorPickerBaseProps<string>> = {
    color: value ?? undefined,
    onChange,
    style: {
      width: '100%',
    },
    ...rest,
  };

  return supportAlpha ? <HexAlphaColorPicker {...props as any} /> : <HexColorPicker {...props as any} />;
}
