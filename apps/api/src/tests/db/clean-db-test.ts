import { getTableName, is, sql, Table } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import * as schema from '../../database/schemas/index.js'

const TABLES = Object.values(schema)
  .filter((value) => is(value, Table))
  .map(getTableName)

export async function cleanDbTest(db: Database) {
  await db.execute(sql.raw(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`))
}
