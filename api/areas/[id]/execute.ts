/**
 * POST /api/areas/[id]/execute
 * Exécute une AREA manuellement
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
  const context = req.body || {};

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Area ID is required',
    });
  }

  try {
    // Récupérer l'AREA
    const { data: area, error: fetchError } = await supabase
      .from('areas')
      .select('*')
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

    // Vérifier que l'AREA est active
    if (!area.is_active) {
      return res.status(400).json({
        success: false,
        error: 'Area is not active',
      });
    }

    // Ici, vous pouvez ajouter la logique d'exécution de l'AREA
    // Pour l'instant, on met juste à jour last_triggered
    const { error: updateError } = await supabase
      .from('areas')
      .update({ 
        last_triggered: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating area:', updateError);
      return res.status(500).json({
        success: false,
        error: updateError.message || 'Error updating area',
      });
    }

    // TODO: Implémenter la logique d'exécution réelle de l'AREA
    // Cela dépend de votre système d'exécution (webhooks, appels API, etc.)

    return res.status(200).json({
      success: true,
      message: 'Area executed successfully',
      data: {
        areaId: id,
        executedAt: new Date().toISOString(),
        context,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

