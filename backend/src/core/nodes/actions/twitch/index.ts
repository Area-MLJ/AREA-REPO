import { ActionNode, ActionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

type TwitchStream = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_name: string;
  title: string;
  viewer_count: number;
  started_at: string;
};

type TwitchStreamsResponse = {
  data: TwitchStream[];
};

async function getStreamIfLive(login: string): Promise<TwitchStream | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const appAccessToken = process.env.TWITCH_APP_ACCESS_TOKEN;

  if (!clientId) {
    throw new Error('TWITCH_CLIENT_ID is missing');
  }
  if (!appAccessToken) {
    throw new Error('TWITCH_APP_ACCESS_TOKEN is missing');
  }

  const url = new URL('https://api.twitch.tv/helix/streams');
  url.searchParams.set('user_login', login);

  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      'Client-Id': clientId,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Twitch API error ${resp.status}: ${text}`);
  }

  const json = (await resp.json()) as TwitchStreamsResponse;
  const stream = json?.data?.[0];
  return stream || null;
}

/**
 * Action Twitch: Déclenche si un streamer est en live (polling)
 * Paramètres:
 * - user_login: login Twitch (ex: gotaga)
 */
export const twitchStreamOnline: ActionNode = {
  type: 'action',
  service: 'twitch',
  name: 'stream_online',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ActionResult> => {
    const user_login = params.user_login;
    if (!user_login || typeof user_login !== 'string') {
      throw new Error('user_login parameter is required');
    }

    const stream = await getStreamIfLive(user_login);

    if (!stream) {
      ctx.logger.debug(`Twitch stream not live for ${user_login}`);
      return { triggered: false };
    }

    ctx.logger.info(`Twitch stream live detected for ${user_login}: ${stream.title}`);

    return {
      triggered: true,
      output: {
        stream_id: stream.id,
        user_login: stream.user_login,
        user_name: stream.user_name,
        title: stream.title,
        game_name: stream.game_name,
        viewer_count: stream.viewer_count,
        started_at: stream.started_at,
      },
    };
  },
};
