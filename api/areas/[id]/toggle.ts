/**
 * POST /api/areas/[id]/toggle
 * Active ou désactive une AREA
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptionsRequest } from '../../cors.ts';


const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  handleOptionsRequest(req, res);

  // Seulement POST
  if (req.method !== 'POST') {
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
    // Récupérer l'AREA actuelle pour obtenir son statut
    const { data: currentArea, error: fetchError } = await supabase
      .from('areas')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Area not found',
        });
      }

      console.error('Error fetching area:', fetchError);
      return res.status(500).json({
        success: false,
        error: fetchError.message || 'Error fetching area',
      });
    }

    // Toggle le statut
    const newStatus = !currentArea.is_active;

    // Mettre à jour l'AREA
    const { data: updatedArea, error: updateError } = await supabase
      .from('areas')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating area:', updateError);
      return res.status(500).json({
        success: false,
        error: updateError.message || 'Error updating area',
      });
    }

    // Transformer les données pour correspondre à l'interface Area
    const formattedArea = {
      id: updatedArea.id,
      name: updatedArea.name,
      description: updatedArea.description || '',
      isActive: updatedArea.is_active ?? true,
      actionService: updatedArea.action_service,
      actionName: updatedArea.action_name,
      reactionService: updatedArea.reaction_service,
      reactionName: updatedArea.reaction_name,
      createdAt: updatedArea.created_at,
      lastTriggered: updatedArea.last_triggered || undefined,
    };

    return res.status(200).json({
      success: true,
      data: formattedArea,
      message: `Area ${newStatus ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

