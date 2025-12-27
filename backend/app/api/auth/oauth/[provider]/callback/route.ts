import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { createSession } from '@/src/lib/auth/session';
import { ApiResponse, AuthResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider.toLowerCase();
    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Erreur OAuth: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Code d\'autorisation manquant' },
        { status: 400 }
      );
    }

    logger.info('OAuth callback received', { provider, code: code.substring(0, 10) + '...' });

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Callback OAuth à implémenter' },
      { status: 501 }
    );
  } catch (error: any) {
    logger.error('OAuth callback error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors du traitement du callback OAuth' },
      { status: 500 }
    );
  }
}
