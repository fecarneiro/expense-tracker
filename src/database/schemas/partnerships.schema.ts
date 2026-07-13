import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './users.schema.js'

export const partnershipsTable = pgTable('partnerships', {
  id: uuid().primaryKey().defaultRandom(),
  userAId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  userBId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  endedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type NewPartnershipRow = typeof partnershipsTable.$inferInsert
export type PartnershipRow = typeof partnershipsTable.$inferSelect
