import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { partnershipCategoriesTable } from './partnership-category.schema.js'
import { partnershipsTable } from './partnerships.schema.js'
import { transactionsTable } from './transaction.schema.js'
import { usersTable } from './user.schema.js'

export const sharedExpensesTable = pgTable('shared_expenses', {
  id: uuid().primaryKey().defaultRandom(),
  partnershipId: uuid()
    .notNull()
    .references(() => partnershipsTable.id, { onDelete: 'cascade' }),
  paidByUserId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  owedByUserId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  owedByTransactionId: uuid()
    .notNull()
    .references(() => transactionsTable.id, { onDelete: 'cascade' }),
  paidByTransactionId: uuid()
    .notNull()
    .references(() => transactionsTable.id, { onDelete: 'cascade' }),
  owedAmountCents: integer().notNull(),
  totalAmountCents: integer().notNull(),
  partnershipCategoryId: uuid()
    .notNull()
    .references(() => partnershipCategoriesTable.id, { onDelete: 'cascade' }),
  description: varchar({ length: 70 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type NewSharedExpenseRow = typeof sharedExpensesTable.$inferInsert
export type SharedExpenseRow = typeof sharedExpensesTable.$inferSelect
