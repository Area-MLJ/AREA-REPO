import { NextResponse } from 'next/server';
import { discordSendMessage } from '@/core/nodes/reactions/discord';
import { NodeContext } from '@/core/engine/node-context';
import httpClient from '@/lib/http-client';
import { logger } from '@/lib/logger';
import { authenticate } from '@/lib/auth';
import userService from '@/core/services/user-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Authentifier l'utilisateur
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id, message } = await request.json();

    if (!channel_id || !message) {
      return NextResponse.json(
        { error: 'channel_id and message are required' },
        { status: 400 }
      );
    }

    // Récupérer le user_service Discord
    const userServices = await userService.getUserServices(user.id);
    const discordService = userServices.find((s) => s.services?.name === 'discord');

    if (!discordService) {
      return NextResponse.json(
        { error: 'Discord service not connected. Please connect Discord first.' },
        { status: 400 }
      );
    }

    // Créer un contexte pour le test
    const ctx: NodeContext = {
      areaId: 'test-area',
      userId: user.id,
      userServiceId: discordService.id,
      httpClient,
      logger,
    };

    // Exécuter la réaction Discord
    const result = await discordSendMessage.execute(ctx, { channel_id, message });

    return NextResponse.json({
      success: result.success,
      data: result.output,
    });
  } catch (error: any) {
    logger.error('Error testing discord reaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to test discord reaction' },
      { status: 500 }
    );
  }
}
