import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { ApiResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { service: string } }
) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body || '{}');

    logger.info(`Webhook received for service ${params.service}`, { service: params.service, payload });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Webhook reçu',
    });
  } catch (error: any) {
    logger.error('Webhook error', { error: error.message, stack: error.stack, service: params.service });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}
