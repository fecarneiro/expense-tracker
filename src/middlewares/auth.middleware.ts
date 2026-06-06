import type { NextFunction, Request, Response } from 'express'
import { accessTokenPayloadSchema } from '../modules/auth/auth.dto.js'
import { Unauthorized } from '../modules/auth/auth.error.js'
import { verifyToken } from '../modules/auth/session/access-token.js'

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies.token

  if (!token) {
    throw new Unauthorized()
  }

  const verifiedToken = await verifyToken(token)

  const parsedPayload = accessTokenPayloadSchema.safeParse(verifiedToken)

  if (!parsedPayload.success) {
    throw new Unauthorized()
  }

  req.auth = {
    userId: parsedPayload.data.userId,
  }

  next()
}
