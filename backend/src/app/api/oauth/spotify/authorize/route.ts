import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

function buildAuthorizeUrl(userId: string): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const jwtSecret = process.env.JWT_SECRET;

  if (!clientId) {
    throw new Error('SPOTIFY_CLIENT_ID is missing');
  }
  if (!redirectUri) {
    throw new Error('SPOTIFY_REDIRECT_URI is missing');
  }
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing');
  }

  const url = new URL('https://accounts.spotify.com/authorize');

  const nonce = randomUUID();
  const state = jwt.sign(
    {
      userId,
      provider: 'spotify',
      nonce,
      type: 'oauth_state',
    },
    jwtSecret,
    { expiresIn: '10m' }
  );

  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set(
    'scope',
    'user-modify-playback-state user-read-playback-state'
  );

  return url.toString();
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const authorizeUrl = buildAuthorizeUrl(userId);
    return NextResponse.redirect(authorizeUrl);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Internal server error' },
      { status: e?.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const authorizeUrl = buildAuthorizeUrl(userId);
    return NextResponse.json({ url: authorizeUrl });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Internal server error' },
      { status: e?.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
