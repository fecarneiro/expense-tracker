import { integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './users.schema.js'

const purposeEnum = pgEnum('linking_code_purpose', ['bot_link', 'user_link'])

export const linkingCodesTable = pgTable(
  'linking_codes',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    code: integer().notNull().unique('linking_codes_unique'),
    purpose: purposeEnum().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('linking_codes_unique_purpose_user_id').on(table.purpose, table.userId)],
)

export type LinkingCodeRow = typeof linkingCodesTable.$inferSelect
export type NewLinkingCodeRow = typeof linkingCodesTable.$inferInsert
