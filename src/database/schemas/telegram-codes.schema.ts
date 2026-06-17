import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const telegramCodesTable = pgTable('telegram_codes', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .unique()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  code: integer().notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
