import type { z } from 'zod'
import { userResponseSchema } from './user.schemas.js'
import type { User } from './user.types.js'

export type UserResponse = z.infer<typeof userResponseSchema>

export function toUserResponse(user: User): UserResponse {
  const { passwordHash, createdAt, ...fields } = user
  return userResponseSchema.parse({
    ...fields,
    lastSeenAt: fields.lastSeenAt?.toISOString() ?? null,
  })
}
