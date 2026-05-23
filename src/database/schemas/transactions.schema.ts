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
import { categoriesTable } from './categories.schema.js'
import { usersTable } from './users.schema.js'

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
    description: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [check('amount_check', sql`${table.amountInCents} > 0`)],
)

export type Transaction = typeof transactionsTable.$inferSelect
export type NewTransaction = typeof transactionsTable.$inferInsert
