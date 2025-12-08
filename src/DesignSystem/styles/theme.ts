/**
 * theme.ts
 * Source unique de vérité pour les tokens de design
 * Définit les couleurs, espacements, typographie, etc.
 */

export const theme = {
  colors: {
    primary: {
      50: '#e6f2e7',
      100: '#c0dec2',
      200: '#96c999',
      300: '#6cb470',
      400: '#4da451',
      500: '#0a4a0e',
      600: '#09420d',
      700: '#07390b',
      800: '#053009',
      900: '#032005',
    },
    neutral: {
      50: '#FAF9F6',
      100: '#F5F4F1',
      200: '#E8E6E1',
      300: '#D1CFC8',
      400: '#B3B1A8',
      500: '#8B8980',
      600: '#6B6962',
      700: '#4D4C47',
      800: '#333330',
      900: '#1A1A18',
    },
    success: {
      500: '#10B981',
      600: '#059669',
    },
    warning: {
      500: '#F59E0B',
      600: '#D97706',
    },
    error: {
      500: '#EF4444',
      600: '#DC2626',
    },
  },
  spacing: {
    0: '0',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    8: '64px',
    10: '80px',
    12: '96px',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    lineHeight: {
      body: '150%',
      heading: '120%',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
} as const;
