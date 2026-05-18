import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { usersTable } from './users.schema.js'

export const categoriesTable = pgTable('categories', {
  id: uuid().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  name: varchar().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
})
