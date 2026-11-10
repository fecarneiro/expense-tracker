import { type AuthUser, type LoginResponse, loginResponseSchema } from '@expense-tracker/contracts'
import { accessTokenConfig } from '../../shared/access-token.js'

export function toLoginResponse(user: AuthUser, accessToken: string): LoginResponse {
  return loginResponseSchema.parse({
    user,
    access_token: accessToken,
    token_type: accessTokenConfig.tokenType,
    expires_in: accessTokenConfig.expiresInSeconds,
  })
}
