import { type AuthUser, authUserSchema } from '@expense-tracker/contracts'
import type { z } from 'zod'
import { userPreferencesSchema } from './user.schemas.js'
import type { User } from './user.types.js'

export type UserPreferences = z.infer<typeof userPreferencesSchema>

export function toUserResponse(user: User): AuthUser {
  const { passwordHash, createdAt, timeZone, lastSeenAt, ...fields } = user
  return authUserSchema.parse({
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
