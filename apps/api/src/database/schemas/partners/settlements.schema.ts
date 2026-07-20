import { sql } from 'drizzle-orm'
import { check, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from '../users.schema.js'
import { partnershipsTable } from './partnerships.schema.js'

export const settlementsTable = pgTable(
  'settlements',
  {
    id: uuid().primaryKey().defaultRandom(),
    partnershipId: uuid()
      .notNull()
      .references(() => partnershipsTable.id),
    fromUserId: uuid()
      .notNull()
      .references(() => usersTable.id),
    toUserId: uuid()
      .notNull()
      .references(() => usersTable.id),
    totalAmountCents: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'settlements_amounts_users_check',
      sql`${table.totalAmountCents} > 0 AND ${table.fromUserId} <> ${table.toUserId}`,
    ),
  ],
)

export type SettlementRow = typeof settlementsTable.$inferSelect
export type NewSettlementRow = typeof settlementsTable.$inferInsert
