import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import * as schemas from '../../database/schemas/index.js'

export async function setupDbTest() {
  const client = new PGlite()

  const dbTest = drizzle({
    client: client,
    schema: schemas,
    casing: 'snake_case',
  })

  await migrate(dbTest, { migrationsFolder: './drizzle' })

  return { client, dbTest }
}
