/**
 * Button.tsx
 * Composant bouton réutilisable avec variants
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#0a4a0e] text-white hover:bg-[#09420d] focus:ring-[#0a4a0e]',
    secondary: 'bg-[#E8E6E1] text-[#1A1A18] hover:bg-[#D1CFC8] focus:ring-[#8B8980]',
    outline: 'border-2 border-[#0a4a0e] text-[#0a4a0e] hover:bg-[#e6f2e7] focus:ring-[#0a4a0e]',
    ghost: 'text-[#0a4a0e] hover:bg-[#e6f2e7] focus:ring-[#0a4a0e]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
