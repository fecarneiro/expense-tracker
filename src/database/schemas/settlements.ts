import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { partnershipsTable } from './partnerships.schema.js'
import { usersTable } from './users.schema.js'

// - id
// - partnership_id
// - from_user_id
// - to_user_id
// - amount_cents
// - occurred_at
// - idempotency_key
// - created_at

export const settlementsTable = pgTable('transactions', {
  id: uuid().primaryKey().defaultRandom(),
  partnershipId: uuid()
    .notNull()
    .references(() => partnershipsTable.id, { onDelete: 'restrict' }),
  fromUserId: uuid()
    .notNull()
    .references(() => usersTable.id),
  toUserId: uuid()
    .notNull()
    .references(() => usersTable.id),
  sharedCategoryId: uuid().notNull(),
  amountCents: integer().notNull(),
  description: varchar({ length: 70 }),
  idempotencyKey: varchar({ length: 255 }),
  occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
