/**
 * AppConstants.ts
 * Constantes applicatives centralisées
 * Valeurs fixes utilisées dans toute l'application
 */

export const APP_NAME = 'ACTION-REACTION';

export const APP_DESCRIPTION = 'Create automation workflows by connecting Actions to REActions';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  SERVICES: '/services',
  AREA_CREATOR: '/area/create',
  AREA_LIST: '/area/list',
  PROFILE: '/profile',
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  USER_EXISTS: 'Un compte existe déjà avec cet email',
  WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
  NETWORK_ERROR: 'Erreur réseau, veuillez réessayer',
  UNKNOWN: 'Une erreur est survenue',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;
