import { forwardRef } from 'react';
import { Checkbox as HeadlessCheckbox, Field, Label, Description } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onChange, label, description, disabled, className }, ref) => {
    const checkboxElement = (
      <HeadlessCheckbox
        ref={ref}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'group relative flex h-5 w-5 items-center justify-center rounded border-2',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-colors',
          checked
            ? 'bg-primary border-primary'
            : 'bg-[rgb(var(--background))] border-[rgb(var(--border))] hover:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {checked && <CheckIcon className="h-4 w-4 text-white" strokeWidth={3} />}
      </HeadlessCheckbox>
    );

    if (!label && !description) {
      return checkboxElement;
    }

    return (
      <Field className="flex items-start gap-3">
        <div className="pt-0.5">{checkboxElement}</div>
        <div className="flex-1">
          {label && (
            <Label className="block text-sm font-medium text-[rgb(var(--foreground))] cursor-pointer">
              {label}
            </Label>
          )}
          {description && (
            <Description className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              {description}
            </Description>
          )}
        </div>
      </Field>
    );
  }
);

Checkbox.displayName = 'Checkbox';
