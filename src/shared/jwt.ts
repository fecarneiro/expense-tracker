import * as jose from 'jose'
import { env } from '../config/env.config.js'

const secret = new TextEncoder().encode(env.JWT_SECRET)
const alg = 'HS256'
const issuer = 'expense-flow'

export async function generateToken(user: { id: string; email: string }) {
  const token = await new jose.SignJWT({ userId: user.id })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(issuer)
    .setExpirationTime('2h')
    .sign(secret)

  return token
}

export async function verifyToken(token: string) {
  const { payload } = await jose.jwtVerify(token, secret, {
    issuer,
    algorithms: [alg],
  })

  return payload
}
