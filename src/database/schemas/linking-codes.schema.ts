import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const linkingCodesTable = pgTable('linking_codes', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .unique()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  code: integer().notNull().unique('linking_codes_unique'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type LinkingCode = typeof linkingCodesTable.$inferSelect
export type NewLinkingCode = typeof linkingCodesTable.$inferInsert
