import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

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

    const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('SPOTIFY_ACCESS_TOKEN is missing');
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
