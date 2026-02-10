import { NextResponse } from 'next/server';
import { newsAction } from '@/core/nodes/actions/news';
import { NodeContext } from '@/core/engine/node-context';
import httpClient from '@/lib/http-client';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const keyword = body?.keyword || 'technologie';

    // Créer un contexte minimal pour le test (pas d'auth requise pour test)
    const ctx: NodeContext = {
      areaId: 'test-area',
      userId: 'test-user',
      userServiceId: 'test-service',
      httpClient,
      logger,
    };

    // Exécuter l'action News
    const result = await newsAction.execute(ctx, { keyword });

    return NextResponse.json({
      success: true,
      triggered: result.triggered,
      data: result.output,
    });
  } catch (error: any) {
    logger.error('Error testing news action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to test news action' 
      },
      { status: 500 }
    );
  }
}

// Permettre aussi GET pour test rapide
export async function GET(request: Request) {
  return POST(request);
}
