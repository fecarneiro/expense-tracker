import { sql } from 'drizzle-orm'
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { usersTable } from './users.schema.js'

export const categoriesTable = pgTable(
  'categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('unique_category_name').on(
      table.userId,
      sql`lower(${table.name})`,
    ),
  ],
)
