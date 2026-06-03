import { sql } from 'drizzle-orm'

import {
  check,
  date,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { type Category, categoriesTable } from './category.schema.js'
import { usersTable } from './user.schema.js'

export const transactionTypeEnum = pgEnum('type', ['income', 'expense'])

export const transactionsTable = pgTable(
  'transactions',
  {
    id: uuid().primaryKey().defaultRandom(),

    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    occurredOn: date({ mode: 'string' }).notNull(),

    categoryId: uuid().notNull(),
    type: transactionTypeEnum().notNull(),

    amountInCents: integer().notNull(),

    notes: varchar({ length: 70 }),

    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },

  (table) => [
    check('amount_check', sql`${table.amountInCents} > 0`),
    foreignKey({
      name: 'transactions_category_user_fk',
      columns: [table.categoryId, table.userId],
      foreignColumns: [categoriesTable.id, categoriesTable.userId],
    }),
  ],
)

export type Transaction = typeof transactionsTable.$inferSelect
export type NewTransaction = typeof transactionsTable.$inferInsert

export type PublicTransactionCategory = Pick<Category, 'id' | 'name'>

export type PublicTransaction = Omit<Transaction, 'userId' | 'categoryId'>

export type PublicTransactionWithCategory = PublicTransaction & {
  category: PublicTransactionCategory
}
