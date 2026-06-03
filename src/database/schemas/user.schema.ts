import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),

  email: varchar({ length: 254 }).notNull().unique(),

  passwordHash: varchar({ length: 255 }).notNull(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
export type PublicUser = Pick<User, 'id' | 'email' | 'createdAt'>

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  }
}
