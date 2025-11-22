import { forwardRef } from 'react';
import { Button as HeadlessButton } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'danger-outline';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-primary to-primary-light hover:brightness-110 text-white shadow-md hover:shadow-lg focus:ring-primary',
  secondary: 'bg-gradient-to-r from-secondary to-secondary-light hover:brightness-110 text-white shadow-md hover:shadow-lg focus:ring-secondary',
  ghost: 'bg-transparent hover:bg-accent text-foreground focus:ring-ring',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline: 'bg-transparent border border-border text-foreground hover:bg-accent focus:ring-ring',
  'danger-outline': 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10 focus:ring-red-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <HeadlessButton
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
