/**
 * Badge.tsx
 * Composant badge pour statuts et labels
 */

import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Badge({ variant = 'neutral', size = 'md', children }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    success: 'bg-[#10B981]/10 text-[#059669]',
    warning: 'bg-[#F59E0B]/10 text-[#D97706]',
    error: 'bg-[#EF4444]/10 text-[#DC2626]',
    neutral: 'bg-[#E8E6E1] text-[#4D4C47]',
    primary: 'bg-[#0a4a0e]/10 text-[#0a4a0e]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
