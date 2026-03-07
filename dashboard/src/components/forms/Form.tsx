import { HTMLAttributes, ReactNode } from 'react';
import {
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  UseControllerProps,
} from 'react-hook-form';

export function Form(props: HTMLAttributes<HTMLDivElement> & { isRequired?: boolean; isInvalid?: boolean }) {
  const { isRequired, isInvalid, children, className, ...rest } = props;
  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#111] rounded-3xl p-5 shadow-sm border border-zinc-200 dark:border-white/10 ${className || ''}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export type FormCardProps = {
  required?: boolean;
  baseControl?: HTMLAttributes<HTMLDivElement>;
  /**
   * Show an error message if not null
   */
  error?: string;
  label?: string | ReactNode;
  description?: string | ReactNode;
  children: ReactNode;
};

export function FormCard({
  label,
  description,
  required,
  baseControl,
  children,
  error,
}: FormCardProps) {
  return (
    <Form isRequired={required} isInvalid={error != null} {...baseControl}>
      <label className="text-base md:text-lg font-medium mb-0 text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <span className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-1">
          {description}
        </span>
      )}
      <div className="mt-2 md:mt-3" />
      {children}
      {error && <span className="text-red-500 text-sm mt-2">{error}</span>}
    </Form>
  );
}

export type FormCardControllerProps<
  TFieldValue extends FieldValues,
  TName extends Path<TFieldValue>
> = {
  control: Omit<FormCardProps, 'error' | 'children'>;
  controller: UseControllerProps<TFieldValue, TName>;
  render: ControllerProps<TFieldValue, TName>['render'];
};

export function FormCardController<
  TFieldValue extends FieldValues,
  TName extends Path<TFieldValue>
>({ control, controller, render }: FormCardControllerProps<TFieldValue, TName>) {
  return (
    <Controller
      {...controller}
      render={(props) => (
        <FormCard {...control} error={props.fieldState.error?.message}>
          {render(props)}
        </FormCard>
      )}
    />
  );
}
