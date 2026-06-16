import { sql } from 'drizzle-orm'
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { categoriesTable } from './category.schema.js'
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
    transactionType: transactionTypeEnum().notNull(),
    amountInCents: integer().notNull(),
    notes: varchar({ length: 70 }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },

  (table) => [
    index('transactions_user_occurred_on_id_idx').on(table.userId, table.occurredOn, table.id),
    check('amount_check', sql`${table.amountInCents} > 0`),
    foreignKey({
      name: 'transactions_category_user_fk',
      columns: [table.categoryId, table.userId],
      foreignColumns: [categoriesTable.id, categoriesTable.userId],
    }),
  ],
)

export type TransactionRow = typeof transactionsTable.$inferSelect
export type NewTransactionRow = typeof transactionsTable.$inferInsert
