import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
