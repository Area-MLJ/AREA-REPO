import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

type TwitchUsersResponse = {
  data: Array<{ id: string; login: string; display_name: string }>;
};

const broadcasterIdCacheByLogin = new Map<string, string>();
let cachedBotUserId: string | null = null;

function applyTemplate(template: string, input: any): string {
  return template
    .replaceAll('{{track_name}}', String(input?.track_name ?? ''))
    .replaceAll('{{artist_name}}', String(input?.artist_name ?? ''))
    .replaceAll('{{track_url}}', String(input?.track_url ?? ''));
}

async function getUserIdByLogin(login: string, clientId: string, accessToken: string): Promise<string> {
  const cached = broadcasterIdCacheByLogin.get(login.toLowerCase());
  if (cached) {
    return cached;
  }

  const url = new URL('https://api.twitch.tv/helix/users');
  url.searchParams.set('login', login);

  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': clientId,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Twitch API error ${resp.status}: ${text}`);
  }

  const json = (await resp.json()) as TwitchUsersResponse;
  const user = json?.data?.[0];
  if (!user?.id) {
    throw new Error(`Twitch user not found for login: ${login}`);
  }

  broadcasterIdCacheByLogin.set(login.toLowerCase(), user.id);
  return user.id;
}

async function getBotUserId(clientId: string, accessToken: string): Promise<string> {
  if (cachedBotUserId) {
    return cachedBotUserId;
  }

  const resp = await fetch('https://api.twitch.tv/helix/users', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': clientId,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Twitch API error ${resp.status}: ${text}`);
  }

  const json = (await resp.json()) as TwitchUsersResponse;
  const user = json?.data?.[0];
  if (!user?.id) {
    throw new Error('Unable to resolve bot user id from TWITCH_BOT_ACCESS_TOKEN');
  }

  cachedBotUserId = user.id;
  return user.id;
}

async function sendChatMessage(params: {
  clientId: string;
  botAccessToken: string;
  broadcasterId: string;
  senderId: string;
  message: string;
}): Promise<void> {
  const resp = await fetch('https://api.twitch.tv/helix/chat/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.botAccessToken}`,
      'Client-Id': params.clientId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      broadcaster_id: params.broadcasterId,
      sender_id: params.senderId,
      message: params.message,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Twitch API error ${resp.status}: ${text}`);
  }
}

/**
 * Reaction Twitch: Envoie un message dans le chat via un bot (sans OAuth utilisateur)
 * Paramètres:
 * - broadcaster_login
 * - message (supporte {{track_name}}, {{artist_name}}, {{track_url}})
 */
export const twitchSendChatMessage: ReactionNode = {
  type: 'reaction',
  service: 'twitch',
  name: 'send_chat_message',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult> => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const botAccessToken = process.env.TWITCH_BOT_ACCESS_TOKEN;

    if (!clientId) {
      throw new Error('TWITCH_CLIENT_ID is missing');
    }
    if (!botAccessToken) {
      throw new Error('TWITCH_BOT_ACCESS_TOKEN is missing');
    }

    const broadcaster_login = params.broadcaster_login;
    const messageTemplate = params.message;

    if (!broadcaster_login || typeof broadcaster_login !== 'string') {
      throw new Error('broadcaster_login parameter is required');
    }
    if (!messageTemplate || typeof messageTemplate !== 'string') {
      throw new Error('message parameter is required');
    }

    const broadcasterId = await getUserIdByLogin(broadcaster_login, clientId, botAccessToken);
    const senderId = await getBotUserId(clientId, botAccessToken);

    const message = applyTemplate(messageTemplate, ctx.input);
    if (!message.trim()) {
      throw new Error('message is empty after template rendering');
    }

    await sendChatMessage({
      clientId,
      botAccessToken,
      broadcasterId,
      senderId,
      message,
    });

    ctx.logger.info(`Twitch chat message sent to ${broadcaster_login}`);

    return {
      success: true,
    };
  },
};
