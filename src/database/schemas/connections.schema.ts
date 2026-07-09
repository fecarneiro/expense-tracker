import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const connectionsTable = pgTable('connections', {
  id: uuid().primaryKey().defaultRandom(),
  userAId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  userBId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type NewConnectionRow = typeof connectionsTable.$inferInsert
export type ConnectionRow = typeof connectionsTable.$inferSelect
