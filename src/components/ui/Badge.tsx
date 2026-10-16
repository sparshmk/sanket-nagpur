import React from 'react';
import { PriorityLevel, RequestStatus, VerificationState } from '../../types/request';
import { formatPriorityBadge, formatVerificationState, formatStatusLabel } from '../../utils/formatting';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'critical' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    critical: 'bg-red-50 text-red-800 border-red-200',
    brand: 'bg-brand-100 text-brand-800 border-brand-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'md',
}) => {
  const { label, badgeBg, badgeText, badgeBorder, dotColor } = formatPriorityBadge(priority);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${badgeBg} ${badgeText} ${badgeBorder}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export const VerificationBadge: React.FC<{ state: VerificationState; size?: 'sm' | 'md' }> = ({
  state,
  size = 'md',
}) => {
  const { label, textClass, bgClass, borderClass } = formatVerificationState(state);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${bgClass} ${textClass} ${borderClass}`}
    >
      <span>{label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: RequestStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  let variant: 'neutral' | 'success' | 'warning' | 'critical' | 'brand' = 'neutral';
  if (status === 'resolved') variant = 'success';
  else if (status === 'assigned') variant = 'brand';
  else if (status === 'matching') variant = 'warning';
  else if (status === 'verified') variant = 'brand';
  else if (status === 'invalid' || status === 'duplicate') variant = 'neutral';

  return (
    <Badge variant={variant} size={size}>
      {formatStatusLabel(status)}
    </Badge>
  );
};
