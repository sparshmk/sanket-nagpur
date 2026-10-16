import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-brand-700 hover:bg-brand-800 text-white shadow-sm focus-visible:ring-brand-700 active:bg-brand-900',
    secondary:
      'bg-surface-mint hover:bg-brand-200 text-brand-900 border border-brand-200 focus-visible:ring-brand-700',
    outline:
      'bg-white hover:bg-surface-bg text-ink-primary border border-surface-border shadow-subtle focus-visible:ring-brand-700',
    amber:
      'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus-visible:ring-amber-600',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-600',
    ghost:
      'bg-transparent hover:bg-surface-muted text-ink-secondary hover:text-ink-primary focus-visible:ring-brand-700',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
