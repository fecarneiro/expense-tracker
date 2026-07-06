import { test as baseTest, expect } from 'vitest'
import { createApp } from '../../app.js'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import type { UserRow } from '../../database/schemas/user.schema.js'
import { generateToken } from '../../shared/access-token.js'
import { cleanDbTest } from '../db/clean-db-test.js'
import { setupDbTest } from '../db/setup-db-test.js'
import { insertTestUser } from '../factories/user.factory.js'

export type AuthenticateResult = {
  token: string
  user: UserRow
}

type AuthenticateOptions = {
  user?: UserRow
}

export const httpTest = baseTest
  // biome-ignore lint/correctness/noEmptyPattern: explanation for empty object
  .extend('db', { scope: 'file' }, async ({}, { onCleanup }) => {
    const { client, dbTest } = await setupDbTest()
    onCleanup(() => client.close())
    return dbTest as unknown as Database
  })
  .extend('app', { scope: 'file' }, async ({ db }) => {
    return createApp(createContainer(db))
  })
  .extend('authenticate', async ({ db }) => {
    return async (options?: AuthenticateOptions): Promise<AuthenticateResult> => {
      const user = options?.user ?? (await insertTestUser(db))
      const token = await generateToken({ id: user.id })
      return { token, user }
    }
  })

httpTest.beforeEach(async ({ db }) => {
  await cleanDbTest(db)
})

export { expect }
