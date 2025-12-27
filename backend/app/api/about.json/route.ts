import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const serverInfo = {
      client: {
        host: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
      server: {
        current_time: Math.floor(Date.now() / 1000),
        services: [
          {
            name: 'google',
            actions: [
              { name: 'new_email', description: 'Nouvel email reçu' },
              { name: 'new_calendar_event', description: 'Nouvel événement calendrier' },
            ],
            reactions: [
              { name: 'send_email', description: 'Envoyer un email' },
              { name: 'create_calendar_event', description: 'Créer un événement calendrier' },
            ],
          },
          {
            name: 'github',
            actions: [
              { name: 'new_issue', description: 'Nouvelle issue créée' },
              { name: 'new_pr', description: 'Nouvelle pull request' },
            ],
            reactions: [
              { name: 'create_issue', description: 'Créer une issue' },
              { name: 'create_comment', description: 'Créer un commentaire' },
            ],
          },
          {
            name: 'discord',
            actions: [
              { name: 'new_message', description: 'Nouveau message' },
            ],
            reactions: [
              { name: 'send_message', description: 'Envoyer un message' },
            ],
          },
          {
            name: 'spotify',
            actions: [
              { name: 'track_played', description: 'Morceau joué' },
            ],
            reactions: [
              { name: 'play_track', description: 'Jouer un morceau' },
              { name: 'add_to_playlist', description: 'Ajouter à une playlist' },
            ],
          },
        ],
      },
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: serverInfo,
    });
  } catch (error) {
    logger.error('About.json error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération des informations' },
      { status: 500 }
    );
  }
}

