import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import fs from 'fs'
import path from 'path'

function loadEnvFromParentDotenv() {
  if (process.env.JWT_SECRET) return

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

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is missing. Define it in backend env or in ../.env when running the backend locally.')
  }
  return secret
})()

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    if (typeof decoded !== 'object' || decoded === null) return null
    const userId = decoded.userId
    if (typeof userId !== 'string' || userId.length === 0) return null
    return { userId }
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}