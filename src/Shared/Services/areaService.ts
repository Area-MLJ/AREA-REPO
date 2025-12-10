/**
 * areaService.ts
 * Service pour gérer les AREAs via l'API backend
 */

import { Area } from '../Constants/MockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Récupère toutes les AREAs
 */
export async function fetchAreas(): Promise<Area[]> {
  try {
    // Vérifier que l'URL de l'API est définie
    if (!API_URL || API_URL === 'undefined') {
      console.warn('VITE_API_URL n\'est pas définie, retour d\'un tableau vide');
      return [];
    }

    const response = await fetch(`${API_URL}/api/areas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Vérifier si la réponse est OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Area[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erreur lors de la récupération des AREAs');
    }

    return result.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des AREAs:', error);
    // Retourner un tableau vide au lieu de throw pour éviter de casser l'app
    return [];
  }
}

/**
 * Récupère une AREA par son ID
 */
export async function fetchAreaById(areaId: string): Promise<Area> {
  try {
    const response = await fetch(`${API_URL}/api/areas/${areaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<Area> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erreur lors de la récupération de l\'AREA');
    }

    return result.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'AREA:', error);
    throw error;
  }
}

/**
 * Active ou désactive une AREA
 */
export async function toggleArea(areaId: string): Promise<Area> {
  try {
    const response = await fetch(`${API_URL}/api/areas/${areaId}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<Area> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erreur lors de la modification de l\'AREA');
    }

    return result.data;
  } catch (error) {
    console.error('Erreur lors de la modification de l\'AREA:', error);
    throw error;
  }
}

/**
 * Exécute une AREA manuellement
 */
export async function executeArea(areaId: string, context?: Record<string, unknown>): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/areas/${areaId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context || {}),
    });

    const result: ApiResponse<{ message?: string }> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'exécution de l\'AREA');
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'AREA:', error);
    throw error;
  }
}

