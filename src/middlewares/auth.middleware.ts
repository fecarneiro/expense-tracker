import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../modules/auth/access-token.js'
import { Unauthorized } from '../modules/auth/auth.error.js'

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = req.cookies.token

  if (!token) {
    throw new Unauthorized()
  }
  const verifiedToken = await verifyToken(token)

  if (!verifiedToken) {
    throw new Unauthorized()
  }

  req.cookies.userId = verifiedToken.userId
  next()
}
