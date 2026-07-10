import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { partnershipsTable } from './partnerships.schema.js'

export const partnershipCategoriesTable = pgTable('partnership_categories', {
  id: uuid().primaryKey().defaultRandom(),
  partnershipId: uuid()
    .notNull()
    .references(() => partnershipsTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 50 }).notNull().unique(),
})

export type PartnershipCategoryRow = typeof partnershipCategoriesTable.$inferSelect
export type NewPartnershipCategoryRow = typeof partnershipCategoriesTable.$inferInsert
