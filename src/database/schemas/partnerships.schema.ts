import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { categoriesTable } from './categories.schema.js'
import { usersTable } from './users.schema.js'

export const partnershipsTable = pgTable('partnerships', {
  id: uuid().primaryKey().defaultRandom(),
  userAId: uuid()
    .notNull()
    .references(() => usersTable.id),
  userBId: uuid()
    .notNull()
    .references(() => usersTable.id),
  endedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const sharedCategoriesTable = pgTable('shared_categories', {
  id: uuid().primaryKey().defaultRandom(),
  partnershipId: uuid()
    .notNull()
    .references(() => partnershipsTable.id),
  name: varchar({ length: 50 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const sharedCategoriesMappingTable = pgTable('shared_category_mappings', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  userCategoryId: uuid()
    .notNull()
    .references(() => categoriesTable.id),
  sharedCategoryId: uuid()
    .notNull()
    .references(() => sharedCategoriesTable.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
