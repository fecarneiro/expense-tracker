import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { categoriesTable } from './categories.schema.js'
import { usersTable } from './users.schema.js'

export const transactionsTable = pgTable('transactions', {
  id: uuid().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  categoryId: uuid()
    .notNull()
    .references(() => categoriesTable.id, { onDelete: 'cascade' }),
  type: varchar().notNull(),
  amountInCents: integer().notNull(),
  description: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
})
