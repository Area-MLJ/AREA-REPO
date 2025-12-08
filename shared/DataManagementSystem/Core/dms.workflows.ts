/**
 * dms.workflows.ts
 * Port d'accès aux Workflows Edge Functions
 * callWorkflow(name, payload) avec normalisation des erreurs
 */

import { getSupabaseConfig } from './dms.config';

export interface WorkflowResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    hint?: string;
    details?: unknown;
  };
}

/**
 * Appelle un workflow Edge Function
 * Aucun accès direct depuis App/DesignSystem - uniquement via hooks
 */
export async function callWorkflow<T = unknown>(
  name: string,
  payload?: Record<string, unknown>
): Promise<WorkflowResponse<T>> {
  try {
    const config = getSupabaseConfig();
    const url = `${config.url}/functions/v1/${name}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: {
          code: `HTTP_${response.status}`,
          message: errorData.message || 'Erreur lors de l\'appel du workflow',
          details: errorData,
        },
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Erreur réseau',
        details: error,
      },
    };
  }
}
