import type { z } from 'zod'
import { userPreferencesSchema, userResponseSchema } from './user.schemas.js'
import type { User } from './user.types.js'

export type UserResponse = z.infer<typeof userResponseSchema>
export type UserPreferences = z.infer<typeof userPreferencesSchema>

export function toUserResponse(user: User): UserResponse {
  const { passwordHash, createdAt, timeZone, lastSeenAt, ...fields } = user
  return userResponseSchema.parse({
    ...fields,
    timezone: timeZone,
    lastSeenAt: lastSeenAt?.toISOString() ?? null,
  })
}

export function toUserPreferences(
  user: Pick<User, 'timeZone' | 'locale' | 'currency'>,
): UserPreferences {
  return userPreferencesSchema.parse(user)
}
