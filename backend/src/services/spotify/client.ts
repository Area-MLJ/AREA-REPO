export class SpotifyApiError extends Error {
  status: number
  bodyText: string

  constructor(message: string, status: number, bodyText: string) {
    super(message)
    this.name = 'SpotifyApiError'
    this.status = status
    this.bodyText = bodyText
  }
}

export async function spotifyApiGet<T>(path: string, accessToken: string): Promise<T> {
  const url = path.startsWith('http') ? path : `https://api.spotify.com${path}`

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new SpotifyApiError(`Spotify API GET ${path} failed`, resp.status, text)
  }

  return (await resp.json()) as T
}

async function spotifyApiRequest(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  accessToken: string,
  body?: unknown
): Promise<Response> {
  const url = path.startsWith('http') ? path : `https://api.spotify.com${path}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`
  }

  const init: RequestInit = { method, headers }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  return fetch(url, init)
}

export async function spotifyApiPut(path: string, accessToken: string, body?: unknown): Promise<void> {
  const resp = await spotifyApiRequest('PUT', path, accessToken, body)
  if (!resp.ok) {
    const text = await resp.text()
    throw new SpotifyApiError(`Spotify API PUT ${path} failed`, resp.status, text)
  }
}

export async function spotifyApiPost(path: string, accessToken: string, body?: unknown): Promise<void> {
  const resp = await spotifyApiRequest('POST', path, accessToken, body)
  if (!resp.ok) {
    const text = await resp.text()
    throw new SpotifyApiError(`Spotify API POST ${path} failed`, resp.status, text)
  }
}
