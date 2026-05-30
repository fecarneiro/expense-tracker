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

test('register returns public user without sensitive fields', async () => {
  const { createUser } = sut()
  const createdUser = await createUser()

  expect(createdUser).toStrictEqual({
    id: expect.any(String),
    email: 'johndoe@email.com',
    createdAt: expect.any(Date),
  })
})

test('login succeed with valid credentials', async () => {
  const { authService, createUser } = sut()
  await createUser()

  const result = await authService.verifyCredentials({
    email: 'johndoe@email.com',
    password: '12345678',
  })

  expect(result).toStrictEqual({
    id: expect.any(String),
    email: 'johndoe@email.com',
    createdAt: expect.any(Date),
  })
})

test('login fails with invalid email', async () => {
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

test('login fails with invalid password', async () => {
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
