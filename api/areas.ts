/**
 * GET /api/areas
 * Récupère toutes les AREAs de l'utilisateur connecté
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptionsRequest } from './cors.ts';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {

  handleOptionsRequest(req, res);

  // Seulement GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader) {
      // Si un token est fourni, on peut récupérer l'utilisateur
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Récupérer les AREAs depuis Supabase
    // Si userId est fourni, on filtre par utilisateur, sinon on retourne toutes les AREAs
    let query = supabase
      .from('areas')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: areas, error } = await query;

    if (error) {
      console.error('Error fetching areas:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error fetching areas',
      });
    }

    // Transformer les données pour correspondre à l'interface Area
    const formattedAreas = (areas || []).map((area: any) => ({
      id: area.id,
      name: area.name,
      description: area.description || '',
      isActive: area.is_active ?? true,
      actionService: area.action_service,
      actionName: area.action_name,
      reactionService: area.reaction_service,
      reactionName: area.reaction_name,
      createdAt: area.created_at,
      lastTriggered: area.last_triggered || undefined,
    }));

    return res.status(200).json({
      success: true,
      data: formattedAreas,
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

