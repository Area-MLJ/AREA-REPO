/**
 * GET /api/areas/[id]
 * Récupère une AREA spécifique par son ID
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptionsRequest } from '../cors';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  // Seulement GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Area ID is required',
    });
  }

  try {
    const { data: area, error } = await supabase
      .from('areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Aucune ligne trouvée
        return res.status(404).json({
          success: false,
          error: 'Area not found',
        });
      }

      console.error('Error fetching area:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error fetching area',
      });
    }

    // Transformer les données pour correspondre à l'interface Area
    const formattedArea = {
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
    };

    return res.status(200).json({
      success: true,
      data: formattedArea,
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

