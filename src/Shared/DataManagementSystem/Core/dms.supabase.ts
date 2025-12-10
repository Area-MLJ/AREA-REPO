/**
 * dms.supabase.ts
 * Client Supabase avec JWT user
 * Construit et exécute les requêtes CRUD validées vers les entités ciblées
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Retourne ou initialise le client Supabase (lazy initialization)
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClientInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Variables d\'environnement Supabase manquantes:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      // Créer un client avec des valeurs par défaut pour éviter le crash
      // L'utilisateur verra des erreurs mais l'app ne crashera pas
      supabaseClientInstance = createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseKey || 'placeholder-key'
      );
    } else {
      supabaseClientInstance = createClient(supabaseUrl, supabaseKey);
    }
  }

  return supabaseClientInstance;
}

// Export via getter pour éviter l'initialisation au top-level
export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof SupabaseClient];
  }
});

/**
 * Interface générique pour les opérations CRUD
 */
export interface CRUDOperations<T> {
  list: (options?: QueryOptions) => Promise<T[]>;
  get: (id: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export interface QueryOptions {
  filters?: Record<string, unknown>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}
