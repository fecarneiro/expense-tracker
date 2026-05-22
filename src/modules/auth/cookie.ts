import type { CookieOptions } from 'express'
import { env } from '../../config/env.config.js'
import { TOKEN_TTL_SECONDS } from './access-token.js'

export const cookieOptions: CookieOptions = {
  path: '/',
  maxAge: TOKEN_TTL_SECONDS * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
}
