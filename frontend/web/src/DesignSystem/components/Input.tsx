/**
 * Input.tsx
 * Composant input avec label et gestion d'erreurs
 */

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#333330] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg border transition-colors
            bg-[#FAF9F6] text-[#1A1A18]
            placeholder:text-[#8B8980]
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-[#EF4444] focus:ring-[#EF4444]'
              : 'border-[#D1CFC8] focus:ring-[#0a4a0e] focus:border-[#0a4a0e]'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-[#6B6962]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
