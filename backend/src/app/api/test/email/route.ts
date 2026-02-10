import { NextResponse } from 'next/server';
import { emailSend } from '@/core/nodes/reactions/email';
import { NodeContext } from '@/core/engine/node-context';
import httpClient from '@/lib/http-client';
import { logger } from '@/lib/logger';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Authentifier l'utilisateur
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'to, subject and body are required' },
        { status: 400 }
      );
    }

    // Créer un contexte pour le test
    const ctx: NodeContext = {
      areaId: 'test-area',
      userId: user.id,
      userServiceId: 'test-service',
      httpClient,
      logger,
    };

    // Exécuter la réaction Email
    const result = await emailSend.execute(ctx, { to, subject, body });

    return NextResponse.json({
      success: result.success,
      data: result.output,
    });
  } catch (error: any) {
    logger.error('Error testing email reaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to test email reaction' },
      { status: 500 }
    );
  }
}
