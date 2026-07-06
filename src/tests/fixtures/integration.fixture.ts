import { test as baseTest, expect } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { cleanDbTest } from '../db/clean-db-test.js'
import { setupDbTest } from '../db/setup-db-test.js'

export const integrationTest = baseTest.extend<{
  db: Database
  container: ReturnType<typeof createContainer>
}>({
  db: [
    // biome-ignore lint/correctness/noEmptyPattern: explanation for empty object
    async ({}, use) => {
      const { client, dbTest } = await setupDbTest()
      await use(dbTest as unknown as Database)
      await client.close()
    },
    { scope: 'file' },
  ],

  container: [
    async ({ db }, use) => {
      await use(createContainer(db))
    },
    { scope: 'file' },
  ],
})

integrationTest.beforeEach(async ({ db }) => {
  await cleanDbTest(db)
})

export { expect }
