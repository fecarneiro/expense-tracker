import { bigint, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const botAccountsTable = pgTable('bot_accounts', {
  id: uuid().primaryKey().defaultRandom(),

  userId: uuid()
    .unique()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  telegramId: bigint({ mode: 'number' }).unique().notNull(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type BotAccountRow = typeof botAccountsTable.$inferSelect
export type NewBotAccount = typeof botAccountsTable.$inferInsert
