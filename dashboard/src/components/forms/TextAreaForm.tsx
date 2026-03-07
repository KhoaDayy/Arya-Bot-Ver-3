import { Textarea } from '@/components/ui/textarea';
import { forwardRef, TextareaHTMLAttributes } from 'react';
import { FormCard } from './Form';
import { WithControl } from './types';

export type TextAreaFormProps = WithControl<TextareaHTMLAttributes<HTMLTextAreaElement>>;

export const TextAreaForm = forwardRef<HTMLTextAreaElement, TextAreaFormProps>(
  ({ control, className, ...input }, ref) => {
    // Remove chakra specific props like variant
    const { variant, ...rest } = input as any;
    return (
      <FormCard {...control}>
        <Textarea className={className} {...rest} ref={ref} />
      </FormCard>
    );
  }
);

TextAreaForm.displayName = 'TextAreaForm';
