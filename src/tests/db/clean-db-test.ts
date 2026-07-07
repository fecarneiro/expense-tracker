import { sql } from 'drizzle-orm'
import type { Database } from '../../database/db.js'

const TABLES = ['transactions', 'categories', 'bot_linking_codes', 'bot_accounts', 'users'] as const

export async function cleanDbTest(db: Database) {
  await db.execute(sql.raw(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`))
}
