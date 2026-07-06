import { sql } from 'drizzle-orm'
import type { Database } from '../../database/db.js'

const TABLES = [
  'transactions',
  'categories',
  'telegram_linking_codes',
  'telegram_accounts',
  'users',
] as const

export async function cleanDbTest(db: Database) {
  await db.execute(sql.raw(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`))
}
