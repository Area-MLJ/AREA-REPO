import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider.toLowerCase();
    const validProviders = ['google', 'github', 'discord', 'spotify'];

    if (!validProviders.includes(provider)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Provider OAuth non supporté: ${provider}` },
        { status: 400 }
      );
    }

    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:8080'}/api/auth/oauth/${provider}/callback`;

    if (!clientId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Configuration OAuth manquante pour ${provider}` },
        { status: 500 }
      );
    }

    const authUrls: Record<string, string> = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid email profile`,
      github: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`,
      discord: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify email`,
      spotify: `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-email user-read-private`,
    };

    const authUrl = authUrls[provider];

    if (!authUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `URL d'autorisation non configurée pour ${provider}` },
        { status: 500 }
      );
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    logger.error('OAuth initiation error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de l\'initiation OAuth' },
      { status: 500 }
    );
  }
}
