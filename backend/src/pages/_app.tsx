/**
 * Next.js App Component
 * Initialisation globale de l'application
 */

import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Logger } from '@/lib/logger'
import { ensureDiscordInitialized } from '@/lib/discord-startup'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialiser le service Discord côté client seulement si on est sur le serveur
    if (typeof window === 'undefined') {
      ensureDiscordInitialized().catch(error => {
        Logger.error('Failed to initialize Discord service in _app', { error })
      })
    }
  }, [])

  return <Component {...pageProps} />
}

// Initialisation côté serveur
App.getInitialProps = async () => {
  try {
    await ensureDiscordInitialized()
  } catch (error) {
    Logger.error('Failed to initialize Discord service in getInitialProps', { error })
  }

  return { pageProps: {} }
}