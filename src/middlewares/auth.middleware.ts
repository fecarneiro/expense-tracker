import type { NextFunction, Request, Response } from 'express'
import { accessTokenPayloadSchema } from '../modules/auth/auth.dto.js'
import { Unauthorized } from '../modules/auth/auth.error.js'
import { verifyToken } from '../shared/access-token.js'

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization

  if (!authorization) {
    throw new Unauthorized()
  }

  const [scheme, token] = authorization.trim().split(/\s+/)

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new Unauthorized()
  }

  let payload: Awaited<ReturnType<typeof verifyToken>>

  try {
    payload = await verifyToken(token)
  } catch {
    throw new Unauthorized()
  }

  const parsedPayload = accessTokenPayloadSchema.safeParse(payload)

  if (!parsedPayload.success) {
    throw new Unauthorized()
  }

  req.auth = {
    userId: parsedPayload.data.userId,
  }

  next()
}
