import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 254 }).notNull().unique('users_email_unique'),
  passwordHash: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type UserRow = typeof usersTable.$inferSelect
export type NewUserRow = typeof usersTable.$inferInsert
