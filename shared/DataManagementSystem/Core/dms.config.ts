/**
 * dms.config.ts
 * Configuration centralisée du Data Management System
 * Gère cache, clés et configuration Supabase
 */

/**
 * Retourne la politique de cache pour une entité
 */
export function getCachePolicy(entityKey: string) {
  return {
    ttl: 5 * 60 * 1000, // 5 minutes par défaut
    enabled: true,
  };
}

/**
 * Génère une clé de cache stable pour une requête
 */
export function generateCacheKey(
  entityKey: string,
  operation: string,
  params?: Record<string, unknown>
): string {
  return `${entityKey}:${operation}:${JSON.stringify(params || {})}`;
}

/**
 * Retourne la configuration Supabase depuis les variables d'environnement
 */
export function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}
