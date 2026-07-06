import { test as baseTest, expect } from 'vitest'
import { createApp } from '../../app.js'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { generateToken } from '../../shared/access-token.js'
import { cleanDbTest } from '../db/clean-db-test.js'
import { setupDbTest } from '../db/setup-db-test.js'
import { insertTestUser } from '../factories/user.factory.js'

export const httpTest = baseTest.extend<{
  db: Database
  app: ReturnType<typeof createApp>
  createAccessToken: (email?: string) => Promise<string>
}>({
  db: [
    // biome-ignore lint/correctness/noEmptyPattern: Vitest fixture has no dependencies
    async ({}, use) => {
      const { client, dbTest } = await setupDbTest()
      await use(dbTest as unknown as Database)
      await client.close()
    },
    { scope: 'file' },
  ],

  app: [
    async ({ db }, use) => {
      await use(createApp(createContainer(db)))
    },
    { scope: 'file' },
  ],

  createAccessToken: async ({ db }, use) => {
    await use(async (email?: string) => {
      const user = await insertTestUser(db, email ? { email } : {})
      return generateToken({ id: user.id })
    })
  },
})

httpTest.beforeEach(async ({ db }) => {
  await cleanDbTest(db)
})

export { expect }
