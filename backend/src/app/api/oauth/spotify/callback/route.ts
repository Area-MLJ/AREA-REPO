import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import userService from '@/core/services/user-service';
import { getSupabaseClient } from '@/lib/db';

async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId) {
    throw new Error('SPOTIFY_CLIENT_ID is missing');
  }
  if (!clientSecret) {
    throw new Error('SPOTIFY_CLIENT_SECRET is missing');
  }
  if (!redirectUri) {
    throw new Error('SPOTIFY_REDIRECT_URI is missing');
  }

  const body = new URLSearchParams();
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('grant_type', 'authorization_code');
  body.set('code', code);
  body.set('redirect_uri', redirectUri);

  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Spotify token exchange failed (${resp.status}): ${text}`);
  }

  return JSON.parse(text);
}

async function fetchSpotifyProfile(accessToken: string): Promise<{ id: string; display_name: string | null }> {
  const resp = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Spotify /me failed (${resp.status}): ${text}`);
  }

  const json = JSON.parse(text);
  if (!json?.id) {
    throw new Error('Spotify /me did not return an id');
  }

  return {
    id: json.id as string,
    display_name: typeof json.display_name === 'string' ? (json.display_name as string) : null,
  };
}

async function getSpotifyServiceId(): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .select('id')
    .eq('name', 'spotify')
    .single();

  if (error || !data?.id) {
    throw new Error('Spotify service not found in database');
  }

  return data.id as string;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state' },
        { status: 400 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'JWT_SECRET is missing' }, { status: 500 });
    }

    const decoded = jwt.verify(state, jwtSecret) as any;
    if (!decoded || decoded.type !== 'oauth_state' || decoded.provider !== 'spotify') {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    const userId = decoded.userId as string;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid state (missing userId)' }, { status: 400 });
    }

    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchSpotifyProfile(tokens.access_token);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const identity = await userService.upsertOAuthIdentity({
      user_id: userId,
      provider: 'spotify',
      provider_user_id: profile.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      expires_at: expiresAt,
    });

    const spotifyServiceId = await getSpotifyServiceId();

    await userService.upsertUserServiceByUserAndService({
      user_id: userId,
      service_id: spotifyServiceId,
      oauth_account_id: identity.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      display_name: profile.display_name || 'Spotify',
    });

    const successRedirect = process.env.SPOTIFY_OAUTH_SUCCESS_REDIRECT;
    if (successRedirect) {
      const redirectUrl = new URL(successRedirect);
      redirectUrl.searchParams.set('provider', 'spotify');
      redirectUrl.searchParams.set('success', 'true');
      return NextResponse.redirect(redirectUrl.toString());
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
