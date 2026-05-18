import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar().notNull().unique(),
  passwordHash: varchar().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
})
