import { sql } from 'drizzle-orm'
import {
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  // unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { categoriesTable } from './categories.schema.js'
import { usersTable } from './users.schema.js'

export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense'])
// TODO: idempotency key
//TODO: remove pgEnum
export const transactionsTable = pgTable(
  'transactions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    createdByUserId: uuid()
      .notNull()
      .references(() => usersTable.id),
    categoryId: uuid().notNull(),
    transactionType: transactionTypeEnum().notNull(),
    amountCents: integer().notNull(),
    description: varchar({ length: 70 }),
    // idempotencyKey: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },

  (table) => [
    index('transactions_user_occurred_at_id_idx').on(table.userId, table.occurredAt, table.id),
    // unique('idempotency_key_user_id').on(table.userId, table.idempotencyKey),
    check('amount_check', sql`${table.amountCents} > 0`),
    foreignKey({
      name: 'transactions_category_user_fk',
      columns: [table.categoryId, table.userId],
      foreignColumns: [categoriesTable.id, categoriesTable.userId],
    }),
  ],
)

export type TransactionRow = typeof transactionsTable.$inferSelect
export type NewTransactionRow = typeof transactionsTable.$inferInsert
