import { NextRequest, NextResponse } from 'next/server';
import areaService from '@/core/services/area-service';
import { z } from 'zod';

const createAreaSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si l'utilisateur a des AREA built-in, sinon les créer
    const areas = await areaService.getAreasByUserId(userId);
    const builtinAreaNames = ['News to Email'];
    const hasBuiltinAreas = areas.some(a => builtinAreaNames.includes(a.name));
    
    if (!hasBuiltinAreas) {
      // Créer les AREA built-in pour cet utilisateur
      try {
        const { createBuiltinAreasForUser } = await import('@/core/services/builtin-area-service');
        const { logger } = await import('@/lib/logger');
        logger.info(`[GET /api/me/areas] User ${userId} missing builtin areas (found ${areas.length} areas), creating them...`);
        await createBuiltinAreasForUser(userId);
        logger.info(`[GET /api/me/areas] Builtin areas created successfully for user ${userId}`);
        // Recharger les AREA après création
        const updatedAreas = await areaService.getAreasByUserId(userId);
        logger.info(`[GET /api/me/areas] Returning ${updatedAreas.length} areas for user ${userId}`);
        return NextResponse.json(updatedAreas);
      } catch (error: any) {
        // Logger l'erreur mais retourner les AREA existantes
        const { logger } = await import('@/lib/logger');
        logger.error(`[GET /api/me/areas] Failed to create builtin areas for user ${userId}:`, error);
        logger.error(`[GET /api/me/areas] Error stack: ${error.stack}`);
      }
    } else {
      const { logger } = await import('@/lib/logger');
      logger.debug(`[GET /api/me/areas] User ${userId} already has builtin areas`);
    }

    return NextResponse.json(areas);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAreaSchema.parse(body);

    const area = await areaService.createArea({
      user_id: userId,
      ...validatedData,
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

