import { forwardRef } from 'react';
import { Input as HeadlessInput, Field, Label, Description } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, description, error, ...props }, ref) => {
    const inputElement = (
      <HeadlessInput
        ref={ref}
        className={cn(
          'w-full px-4 py-2 border rounded-lg bg-[rgb(var(--input))] border-[rgb(var(--border))] text-[rgb(var(--foreground))]',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
    );

    if (!label && !description && !error) {
      return inputElement;
    }

    return (
      <Field>
        {label && (
          <Label className="block text-sm font-medium mb-2 text-[rgb(var(--foreground))]">
            {label}
          </Label>
        )}
        {inputElement}
        {description && !error && (
          <Description className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
            {description}
          </Description>
        )}
        {error && (
          <Description className="text-xs text-red-500 mt-2">
            {error}
          </Description>
        )}
      </Field>
    );
  }
);

Input.displayName = 'Input';
