import { createClient } from '@supabase/supabase-js'

import fs from 'fs'
import path from 'path'

function loadEnvFromParentDotenv() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const dotenvPath = path.resolve(process.cwd(), '..', '.env')
    if (!fs.existsSync(dotenvPath)) return

    const raw = fs.readFileSync(dotenvPath, 'utf-8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eq = trimmed.indexOf('=')
      if (eq === -1) continue

      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // no-op (best effort)
  }
}

loadEnvFromParentDotenv()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is missing. Define it in backend env or in ../.env when running the backend locally.')
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is missing. Define it in backend env or in ../.env when running the backend locally.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})