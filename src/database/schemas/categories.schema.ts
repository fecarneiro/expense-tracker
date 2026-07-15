import { sql } from 'drizzle-orm'
import { pgEnum, pgTable, timestamp, unique, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { usersTable } from './users.schema.js'

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense'])

export const categoriesTable = pgTable(
  'categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    name: varchar({ length: 50 }).notNull(),
    categoryType: categoryTypeEnum().notNull(),
    systemKey: varchar({ length: 50 }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('unique_category_name_type').on(
      table.userId,
      table.categoryType,
      sql`lower(${table.name})`,
    ),
    unique('unique_category_id_user_id').on(table.id, table.userId),
  ],
)

export type CategoryRow = typeof categoriesTable.$inferSelect
export type NewCategoryRow = typeof categoriesTable.$inferInsert
