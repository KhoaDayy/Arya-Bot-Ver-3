import { Calendar, CalendarProps } from 'react-calendar';
import { FormCard } from './Form';
import { ControlledInput } from './types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { AiTwotoneCalendar as CalendarIcon } from 'react-icons/ai';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useController } from 'react-hook-form';

export function DatePicker(props: CalendarProps) {
  return (
    <Calendar
      view={'month'}
      prevLabel={<MdChevronLeft className="w-6 h-6 mt-1" />}
      nextLabel={<MdChevronRight className="w-6 h-6 mt-1" />}
      {...props}
      value={props.value ?? null}
    />
  );
}

export type DatePickerFormProps = Omit<CalendarProps, 'value' | 'onChange'>;

export const DatePickerForm: ControlledInput<DatePickerFormProps, CalendarProps['value']> = ({
  control,
  controller,
  ...props
}) => {
  const {
    field: { ref, ...field },
    fieldState,
  } = useController(controller);

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <DatePicker inputRef={ref} {...field} {...props} />
    </FormCard>
  );
};

export const SmallDatePickerForm: ControlledInput<DatePickerFormProps, CalendarProps['value']> = ({
  control,
  controller,
  ...props
}) => {
  const {
    field: { ref, ...field },
    fieldState,
  } = useController(controller);

  const text = field.value?.toLocaleString(undefined, {
    dateStyle: 'short',
  });

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative w-full cursor-pointer">
            <Input
              value={text ?? ''}
              placeholder="Chọn ngày"
              readOnly
              className="pr-10 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 rounded-xl cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500">
              <CalendarIcon />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <DatePicker inputRef={ref} {...field} {...props} />
        </PopoverContent>
      </Popover>
    </FormCard>
  );
};
