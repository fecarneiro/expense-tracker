import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/db/setup-db-test.js'
import { defaultCategories } from '../categories/category.defaults.js'
import { CategoryAlreadyExistsError } from '../categories/category.error.js'
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
  return createContainer(dbTest)
}

test('register creates a user with default categories', async () => {
  const container = sut()
  const user = await container.authService.register({
    email: 'johndoe@email.com',
    password: '12345678',
  })

  const userCategories = await container.categoryService.findAll({ userId: user.id })
  expect(userCategories.length).toBe(defaultCategories.length)
})

test('register fails when the default categories already exist', async () => {
  const container = sut()
  const user = await container.authService.register({
    email: 'johndoe@email.com',
    password: '12345678',
  })

  await expect(
    container.categoryService.createDefaultsForUser({ userId: user.id }, dbTest),
  ).rejects.toThrow(new CategoryAlreadyExistsError())
})

test('login returns the public user with valid credentials', async () => {
  const container = sut()
  const user = await container.authService.register({
    email: 'johndoe@email.com',
    password: '12345678',
  })

  const result = await container.authService.verifyCredentials({
    email: 'johndoe@email.com',
    password: '12345678',
  })
  expect(result).toStrictEqual(user)
})

test('login fails when the provided email is not registered', async () => {
  const container = sut()
  await expect(
    container.authService.verifyCredentials({
      email: 'johndoe_wrong@email.com',
      password: '12345678',
    }),
  ).rejects.toThrow(new InvalidCredentialsError())
})

test('login fails when the password is wrong', async () => {
  const container = sut()
  const user = await container.authService.register({
    email: 'johndoe@email.com',
    password: '12345678',
  })

  await expect(
    container.authService.verifyCredentials({
      email: user.email,
      password: '123456789',
    }),
  ).rejects.toThrow(new InvalidCredentialsError())
})
