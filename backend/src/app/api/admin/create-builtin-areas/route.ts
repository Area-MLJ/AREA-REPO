import { NextRequest, NextResponse } from 'next/server';
import { createBuiltinAreasForUser } from '@/core/services/builtin-area-service';
import { logger } from '@/lib/logger';

/**
 * Endpoint pour créer les AREA built-in pour un utilisateur existant
 * Utile pour les utilisateurs qui se sont inscrits avant l'implémentation
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Créer les AREA built-in pour l'utilisateur
    await createBuiltinAreasForUser(userId);

    return NextResponse.json({
      success: true,
      message: 'Builtin areas created successfully',
    });
  } catch (error: any) {
    logger.error('Error creating builtin areas:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create builtin areas' },
      { status: 500 }
    );
  }
}

