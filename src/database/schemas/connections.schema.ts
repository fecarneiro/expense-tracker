import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const statusEnum = pgEnum('connection_status', ['pending', 'accepted', 'rejected'])

export const connectionsTable = pgTable('connections', {
  id: uuid().primaryKey().defaultRandom(),
  connectionId: uuid().notNull(),
  userAId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  userBId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  status: statusEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type NewConnectionRow = typeof connectionsTable.$inferInsert
export type ConnectionRow = typeof connectionsTable.$inferSelect
