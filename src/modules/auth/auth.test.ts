import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { InvalidCredentialsError } from './auth.error.js'

let dbTest: Database

beforeAll(async () => {
  const setup = await setupDbTest()
  dbTest = setup.dbTest as unknown as Database

  return async () => {
    setup.client.close()
  }
})

beforeEach(async () => {
  await dbTest.delete(usersTable)
})

function sut() {
  const container = createContainer(dbTest)
  async function createUser() {
    return container.authService.register({
      email: 'johndoe@email.com',
      password: '12345678',
    })
  }

  return { ...container, createUser }
}

test('login returns the public user with valid credentials', async () => {
  const { authService, createUser } = sut()
  await createUser()

  const result = await authService.verifyCredentials({
    email: 'johndoe@email.com',
    password: '12345678',
  })

  expect(result).toStrictEqual({
    id: expect.any(String),
    email: 'johndoe@email.com',
  })
})

test('login fails when the email does not exist', async () => {
  const { authService, createUser } = sut()

  await createUser()

  const loginInput = {
    email: 'johndoe_wrong@email.com',
    password: '12345678',
  }

  await expect(authService.verifyCredentials(loginInput)).rejects.toThrow(
    new InvalidCredentialsError(),
  )
})

test('login fails when the password is wrong', async () => {
  const { authService, createUser } = sut()

  await createUser()

  const loginInput = {
    email: 'johndoe@email.com',
    password: '123456789',
  }

  await expect(authService.verifyCredentials(loginInput)).rejects.toThrow(
    new InvalidCredentialsError(),
  )
})
