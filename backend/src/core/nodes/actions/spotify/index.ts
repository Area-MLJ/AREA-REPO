import { ActionNode, ActionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';
import userService from '../../../services/user-service';

type CurrentlyPlayingResponse = {
  is_playing?: boolean;
  item?: {
    id?: string;
    name?: string;
    uri?: string;
    external_urls?: { spotify?: string };
    artists?: Array<{ name?: string }>;
  };
};

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
  return ts <= Date.now() + 60_000;
}

async function getCurrentlyPlaying(accessToken: string): Promise<CurrentlyPlayingResponse | null> {
  const resp = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 204 si rien en cours
  if (resp.status === 204) {
    return null;
  }

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Spotify API error ${resp.status}: ${text}`);
  }

  return (await resp.json()) as CurrentlyPlayingResponse;
}

// Cache en mémoire (par instance) pour éviter de déclencher en boucle
const lastTrackIdByAreaActionId = new Map<string, string>();

/**
 * Action Spotify: Déclenche quand le morceau en cours change (polling)
 * Output:
 * - track_id
 * - track_name
 * - artist_name
 * - track_url
 * - track_uri
 */
export const spotifyTrackChanged: ActionNode = {
  type: 'action',
  service: 'spotify',
  name: 'track_changed',
  execute: async (ctx: NodeContext, _params: Record<string, any>): Promise<ActionResult> => {
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

    const playing = await getCurrentlyPlaying(accessToken);
    if (!playing?.item?.id) {
      return { triggered: false };
    }

    if (playing.is_playing === false) {
      return { triggered: false };
    }

    const trackId = playing.item.id;
    const cacheKey = ctx.areaActionId ?? ctx.userServiceId;

    const lastTrackId = lastTrackIdByAreaActionId.get(cacheKey);
    if (lastTrackId === trackId) {
      return { triggered: false };
    }

    lastTrackIdByAreaActionId.set(cacheKey, trackId);

    const trackName = playing.item.name || 'Unknown track';
    const artistName = playing.item.artists?.map((a) => a.name).filter(Boolean).join(', ') || 'Unknown artist';
    const trackUrl = playing.item.external_urls?.spotify;
    const trackUri = playing.item.uri;

    ctx.logger.info(`Spotify track changed: ${trackName} - ${artistName}`);

    return {
      triggered: true,
      output: {
        track_id: trackId,
        track_name: trackName,
        artist_name: artistName,
        track_url: trackUrl,
        track_uri: trackUri,
      },
    };
  },
};
