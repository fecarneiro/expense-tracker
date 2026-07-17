import { test as baseTest, expect } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { cleanDbTest } from '../db/clean-db-test.js'
import { setupDbTest } from '../db/setup-db-test.js'

export const integrationTest = baseTest
  // biome-ignore lint/correctness/noEmptyPattern: Vitest fixture has no dependencies
  .extend('db', { scope: 'file' }, async ({}, { onCleanup }) => {
    const { client, dbTest } = await setupDbTest()
    onCleanup(() => client.close())
    return dbTest as unknown as Database
  })
  .extend('container', { scope: 'file' }, async ({ db }) => {
    return createContainer(db)
  })

integrationTest.beforeEach(async ({ db }) => {
  await cleanDbTest(db)
})

export { expect }
