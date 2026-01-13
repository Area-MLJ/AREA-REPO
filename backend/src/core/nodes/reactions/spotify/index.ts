import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';
import userService from '../../../services/user-service';

function parseSpotifyTrackUri(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith('spotify:track:')) {
    return trimmed;
  }
  const match = trimmed.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (!match) {
    throw new Error('Invalid track_url');
  }

  return `spotify:track:${match[1]}`;
}

async function refreshSpotifyAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId) {
    throw new Error('SPOTIFY_CLIENT_ID is missing');
  }
  if (!clientSecret) {
    throw new Error('SPOTIFY_CLIENT_SECRET is missing');
  }

  const body = new URLSearchParams();
  body.set('grant_type', 'refresh_token');
  body.set('refresh_token', refreshToken);
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);

  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Spotify refresh failed (${resp.status}): ${text}`);
  }

  return JSON.parse(text);
}

function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  const ts = Date.parse(expiresAt);
  if (Number.isNaN(ts)) {
    return false;
  }
  // Refresh a bit early to avoid race conditions
  return ts <= Date.now() + 60_000;
}

async function playTrack(accessToken: string, trackUri: string, deviceId?: string): Promise<void> {
  const url = new URL('https://api.spotify.com/v1/me/player/play');
  if (deviceId) {
    url.searchParams.set('device_id', deviceId);
  }

  const resp = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });

  // Spotify renvoie 204 No Content en cas de succès
  if (resp.status === 204) {
    return;
  }

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Spotify API error ${resp.status}: ${text}`);
  }
}

/**
 * Reaction Spotify: Lance un morceau
 * Paramètres:
 * - track_url: URL Spotify ou URI spotify:track:...
 * - device_id (optionnel)
 */
export const spotifyPlayTrack: ReactionNode = {
  type: 'reaction',
  service: 'spotify',
  name: 'play_track',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult> => {
    const track_url = params.track_url;
    const device_id = params.device_id;

    if (!track_url || typeof track_url !== 'string') {
      throw new Error('track_url parameter is required');
    }

    const userServiceInstance = await userService.getUserServiceById(ctx.userServiceId);
    if (!userServiceInstance) {
      throw new Error('Spotify user service not found');
    }

    if (!userServiceInstance.access_token) {
      throw new Error('Spotify access token not found');
    }

    let accessToken = userServiceInstance.access_token;

    if (isTokenExpired(userServiceInstance.token_expires_at)) {
      if (!userServiceInstance.refresh_token) {
        throw new Error('Spotify refresh token not found');
      }

      const refreshed = await refreshSpotifyAccessToken(userServiceInstance.refresh_token);
      accessToken = refreshed.access_token;
      const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

      await userService.updateUserServiceTokens({
        user_service_id: userServiceInstance.id,
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token ?? userServiceInstance.refresh_token,
        token_expires_at: expiresAt,
      });
    }

    const trackUri = parseSpotifyTrackUri(track_url);

    const deviceId = typeof device_id === 'string' && device_id.length > 0 ? device_id : undefined;

    await playTrack(accessToken, trackUri, deviceId);

    ctx.logger.info(`Spotify track started: ${trackUri}`);

    return {
      success: true,
      output: {
        track_uri: trackUri,
      },
    };
  },
};
