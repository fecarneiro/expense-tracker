import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from '../users.schema.js'

export const partnershipsTable = pgTable('partnerships', {
  id: uuid().primaryKey().defaultRandom(),
  userAId: uuid()
    .notNull()
    .references(() => usersTable.id),
  userBId: uuid()
    .notNull()
    .references(() => usersTable.id),
  endedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type PartnershipRow = typeof partnershipsTable.$inferSelect
export type NewPartnershipRow = typeof partnershipsTable.$inferInsert
