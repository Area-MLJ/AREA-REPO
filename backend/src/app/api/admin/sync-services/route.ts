import { NextRequest, NextResponse } from 'next/server';
import { syncServices } from '@/core/services/service-loader';
import { logger } from '@/lib/logger';

/**
 * Endpoint pour forcer la synchronisation des services depuis les fichiers JSON
 * Protégé par authentification (middleware)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on autorise tous les utilisateurs authentifiés

    logger.info(`Manual service sync requested by user ${userId}`);

    // Forcer la synchronisation
    await syncServices();

    return NextResponse.json({
      success: true,
      message: 'Services synchronized successfully',
    });
  } catch (error: any) {
    logger.error('Error in sync-services endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync services' },
      { status: 500 }
    );
  }
}

