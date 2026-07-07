import type { z } from 'zod'
import { accessTokenConfig } from '../../shared/access-token.js'
import type { UserResponse } from '../users/user.mapper.js'
import { loginResponseSchema, registerResponseSchema } from './auth.schemas.js'

export type RegisterResponse = z.infer<typeof registerResponseSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>

export function toRegisterResponse(user: UserResponse): RegisterResponse {
  return registerResponseSchema.parse(user)
}

export function toLoginResponse(user: UserResponse, accessToken: string): LoginResponse {
  return loginResponseSchema.parse({
    user,
    access_token: accessToken,
    token_type: accessTokenConfig.tokenType,
    expires_in: accessTokenConfig.expiresInSeconds,
  })
}
