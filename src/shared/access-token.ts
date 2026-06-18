import * as jose from 'jose'
import { env } from '../config/app.config.js'

const secret = new TextEncoder().encode(env.JWT_SECRET)
const alg = 'HS256'
const issuer = 'expense-tracker'

export const accessTokenConfig = {
  tokenType: 'Bearer',
  expiresInSeconds: 60 * 60 * 2, // 2 hours, in seconds
} as const

export async function generateToken(user: { id: string }) {
  const token = await new jose.SignJWT()
    .setProtectedHeader({ alg })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer(issuer)
    .setExpirationTime(`${accessTokenConfig.expiresInSeconds}s`)
    .sign(secret)

  return token
}

export async function verifyToken(token: string) {
  const { payload } = await jose.jwtVerify(token, secret, {
    issuer,
    algorithms: [alg],
    requiredClaims: ['sub', 'exp'],
  })

  return { userId: payload.sub }
}
