import { beforeAll, beforeEach, expect, test } from 'vitest'
import type { Database } from '../../database/db.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { PasswordHasher } from '../../shared/password-hasher.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { UserRepository } from '../users/user.repository.js'
import { InvalidCredentialsError } from './auth.error.js'
import { AuthService } from './auth.service.js'

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
  const userRepository = new UserRepository(dbTest)
  const passwordHasher = new PasswordHasher()
  const authService = new AuthService(userRepository, passwordHasher)

  async function createUser() {
    return authService.register({
      email: 'johndoe@email.com',
      password: '12345678',
    })
  }

  return { authService, createUser }
}

test('register new userwith succes', async () => {
  const { createUser } = sut()
  const createdUser = await createUser()

  expect(createdUser.email).toBe('johndoe@email.com')
  expect(createdUser).not.toHaveProperty('passwordHash')
  expect(createdUser).not.toHaveProperty('password')
})

test('login succeed with valid credentials', async () => {
  const { authService, createUser } = sut()

  await createUser()

  const loginInput = {
    email: 'johndoe@email.com',
    password: '12345678',
  }

  expect(await authService.verifyCredentials(loginInput)).toBeTruthy()
})

test('login fails with invalid credentials', async () => {
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
