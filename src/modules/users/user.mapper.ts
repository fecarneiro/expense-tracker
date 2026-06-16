import type { PublicUser, User } from './user.types.js'

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
  }
}
