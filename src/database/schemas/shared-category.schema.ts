import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { connectionsTable } from './connections.schema.js'

export const sharedCategoriesTable = pgTable('shared_categories', {
  id: uuid().primaryKey().defaultRandom(),
  connectionId: uuid()
    .notNull()
    .references(() => connectionsTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 50 }).notNull().unique(),
})

export type SharedCategoryRow = typeof sharedCategoriesTable.$inferSelect
export type NewSharedCategoryRow = typeof sharedCategoriesTable.$inferInsert
