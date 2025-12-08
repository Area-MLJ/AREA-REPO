/**
 * SharedIndex.ts
 * Point d'entrée centralisé pour les exports de la couche Shared
 * Réexporte Constants, Providers, et l'API publique du DMS
 */

// Constants
export * from './Constants/AppConstants';
export * from './Constants/MockData';

// Providers
export { AuthProvider, useAuth } from './Providers/AuthProvider';

// DMS Public API
// export * from './DataManagementSystem/Hooks/UseEntity';
// export * from './DataManagementSystem/Hooks/UseUniversalSearch';
// export * from './DataManagementSystem/Hooks/UseWorkflow';
