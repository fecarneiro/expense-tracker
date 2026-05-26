import { sql } from 'drizzle-orm'

import {
  check,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { categoriesTable } from '../categories/category.entity.js'
import { usersTable } from '../users/user.entity.js'

export const transactionTypeEnum = pgEnum('type', ['income', 'expense'])

export const transactionsTable = pgTable(
  'transactions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    categoryId: uuid()
      .notNull()
      .references(() => categoriesTable.id, { onDelete: 'cascade' }),
    type: transactionTypeEnum().notNull(),
    amountInCents: integer().notNull(),
    description: varchar({ length: 70 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check('amount_check', sql`${table.amountInCents} > 0`)],
)

export type Transaction = typeof transactionsTable.$inferSelect
export type NewTransaction = typeof transactionsTable.$inferInsert
export type PublicTransaction = Pick<
  Transaction,
  'id' | 'categoryId' | 'type' | 'amountInCents' | 'description' | 'createdAt'
>

export function toPublicTransaction(
  transaction: Transaction,
): PublicTransaction {
  return {
    id: transaction.id,
    categoryId: transaction.categoryId,
    type: transaction.type,
    amountInCents: transaction.amountInCents,
    description: transaction.description,
    createdAt: transaction.createdAt,
  }
}
