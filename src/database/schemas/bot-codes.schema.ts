import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const botLinkingCodesTable = pgTable('bot_linking_codes', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .unique()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  code: integer().notNull().unique('bot_linking_codes_unique'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type LinkingCode = typeof botLinkingCodesTable.$inferSelect
export type NewLinkingCode = typeof botLinkingCodesTable.$inferInsert
