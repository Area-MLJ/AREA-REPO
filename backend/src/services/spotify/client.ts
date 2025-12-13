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
    throw new Error(`Spotify API GET ${path} failed (${resp.status}): ${text}`)
  }

  return (await resp.json()) as T
}
