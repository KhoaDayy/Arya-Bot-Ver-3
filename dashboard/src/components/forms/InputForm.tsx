import { Input } from '@/components/ui/input';
import { forwardRef, InputHTMLAttributes } from 'react';
import { FormCard } from './Form';
import { WithControl } from './types';

export type InputFormProps = WithControl<InputHTMLAttributes<HTMLInputElement>>;

export const InputForm = forwardRef<HTMLInputElement, InputFormProps>(
  ({ control, className, ...props }, ref) => {
    // Remove chakra specific props like variant
    const { variant, ...rest } = props as any;
    return (
      <FormCard {...control}>
        <Input ref={ref} className={className} {...rest} />
      </FormCard>
    );
  }
);

InputForm.displayName = 'InputForm';
