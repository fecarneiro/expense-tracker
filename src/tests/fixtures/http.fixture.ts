import { test as baseTest, expect } from 'vitest'
import { createApp } from '../../app.js'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import type { UserRow } from '../../database/schemas/users.schema.js'
import type { UserResponse } from '../../modules/users/user.mapper.js'
import { generateToken } from '../../shared/access-token.js'
import { TEST_EMAIL, TEST_PASSWORD } from '../constants.js'
import { cleanDbTest } from '../db/clean-db-test.js'
import { setupDbTest } from '../db/setup-db-test.js'
import { insertTestUser } from '../factories/user.factory.js'

export type AuthenticateResult = {
  token: string
  user: UserRow
}

export type AuthenticateWithPasswordResult = {
  token: string
  password: string
  user: UserResponse
}

type AuthenticateOptions = {
  user?: UserRow
}

type AuthenticateWithPasswordOptions = {
  email?: string
  password?: string
}

export const httpTest = baseTest
  // biome-ignore lint/correctness/noEmptyPattern: Vitest fixture has no dependencies
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
  .extend('authenticateWithPassword', async ({ db }) => {
    return async (
      options?: AuthenticateWithPasswordOptions,
    ): Promise<AuthenticateWithPasswordResult> => {
      const container = createContainer(db)
      const email = options?.email ?? TEST_EMAIL
      const password = options?.password ?? TEST_PASSWORD
      const user = await container.userService.createWithPassword({ email, password })
      const token = await generateToken({ id: user.id })
      return { token, password, user }
    }
  })

httpTest.beforeEach(async ({ db }) => {
  await cleanDbTest(db)
})

export { expect }
