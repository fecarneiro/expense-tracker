import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 254 }).notNull().unique('users_email_unique'),
  passwordHash: varchar({ length: 255 }).notNull(),

  timeZone: varchar({ length: 100 }).notNull(),
  currency: varchar({ length: 3 }).notNull(),
  locale: varchar({ length: 10 }).notNull(),

  lastSeenAt: timestamp({ withTimezone: true }), // nullable
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type UserRow = typeof usersTable.$inferSelect
export type NewUserRow = typeof usersTable.$inferInsert
