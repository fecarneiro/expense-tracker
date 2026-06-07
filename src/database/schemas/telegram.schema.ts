import { bigint, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const telegramTable = pgTable('telegram', {
  id: uuid().primaryKey().defaultRandom(),

  userId: uuid()
    .unique()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  telegramId: bigint({ mode: 'number' }).unique().notNull(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type Telegram = typeof telegramTable.$inferSelect
export type NewTelegram = typeof telegramTable.$inferInsert
