import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { schemas } from '../database/schemas/schema.js'

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

// const { client, dbTest } = await setupDbTest()

// const data = {
//   email: 'test@gmail.com',
//   passwordHash: '12345678',
// }

// const user = await dbTest.insert(usersTable).values(data).returning()
// console.log(user)
// client.close()
