import { sql } from 'drizzle-orm'
import { check, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from '../users.schema.js'
import { partnershipsTable } from './partnerships.schema.js'
import { sharedCategoriesTable } from './shared-categories.schema.js'

export const sharedExpensesTable = pgTable(
  'shared_expenses',
  {
    id: uuid().primaryKey().defaultRandom(),
    partnershipId: uuid()
      .notNull()
      .references(() => partnershipsTable.id),
    payerUserId: uuid()
      .notNull()
      .references(() => usersTable.id),
    owedUserId: uuid()
      .notNull()
      .references(() => usersTable.id),
    totalAmountCents: integer().notNull(),
    owedAmountCents: integer().notNull(),
    sharedCategoryId: uuid()
      .notNull()
      .references(() => sharedCategoriesTable.id),
    // FK to settlements when that module exists
    settlementId: uuid(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'shared_expenses_amounts_check',
      sql`${table.totalAmountCents} > 0
        AND ${table.owedAmountCents} > 0
        AND ${table.owedAmountCents} <= ${table.totalAmountCents}
        AND ${table.payerUserId} <> ${table.owedUserId}`,
    ),
  ],
)

export type SharedExpenseRow = typeof sharedExpensesTable.$inferSelect
export type NewSharedExpenseRow = typeof sharedExpensesTable.$inferInsert
