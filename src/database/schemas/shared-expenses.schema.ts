import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { partnershipCategoriesTable } from './partnership-category.schema.js'
import { partnershipsTable } from './partnerships.schema.js'
import { settlementsTable } from './settlements.js'
import { transactionsTable } from './transactions.schema.js'
import { usersTable } from './users.schema.js'

export const sharedExpensesTable = pgTable('shared_expenses', {
  id: uuid().primaryKey().defaultRandom(),
  partnershipId: uuid()
    .notNull()
    .references(() => partnershipsTable.id, { onDelete: 'restrict' }),
  paidByUserId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  owedByUserId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  owedAmountCents: integer().notNull(),
  totalAmountCents: integer().notNull(),
  partnershipCategoryId: uuid()
    .notNull()
    .references(() => partnershipCategoriesTable.id, { onDelete: 'restrict' }),
  settlementId: uuid().references(() => settlementsTable.id, { onDelete: 'restrict' }),
  description: varchar({ length: 70 }),
  idempotencyKey: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type NewSharedExpenseRow = typeof sharedExpensesTable.$inferInsert
export type SharedExpenseRow = typeof sharedExpensesTable.$inferSelect
