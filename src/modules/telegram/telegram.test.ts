import { beforeAll, beforeEach, expect, test } from 'vitest'
import type { Database } from '../../database/db.js'
import { telegramTable } from '../../database/schemas/telegram.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { PasswordHasher } from '../../shared/password-hasher.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { InvalidCredentialsError } from '../auth/auth.error.js'
import { AuthService } from '../auth/auth.service.js'
import { UserRepository } from '../users/user.repository.js'
import { TelegramRepository } from './telegram.repository.js'
import { TelegramService } from './telegram.service.js'

let dbTest: Database

beforeAll(async () => {
  const setup = await setupDbTest()
  dbTest = setup.dbTest as unknown as Database

  return async () => {
    setup.client.close()
  }
})

beforeEach(async () => {
  await dbTest.delete(telegramTable)
  await dbTest.delete(usersTable)
})

function sut() {
  const userRepository = new UserRepository(dbTest)
  const passwordHasher = new PasswordHasher()
  const telegramRepository = new TelegramRepository(dbTest)
  const authService = new AuthService(userRepository, passwordHasher)
  const telegramService = new TelegramService(authService, telegramRepository)

  async function createUser() {
    return authService.register({
      email: 'johndoe@email.com',
      password: '12345678',
    })
  }

  return { telegramService, createUser }
}

test('linkAccount links a telegram account to an existing user', async () => {
  const { telegramService, createUser } = sut()

  const user = await createUser()

  const linkedTelegramAccount = await telegramService.linkAccount({
    email: user.email,
    password: '12345678',
    telegramId: 1234567832131319,
  })

  expect(linkedTelegramAccount).toStrictEqual({
    id: expect.any(String),
    userId: user.id,
    telegramId: 1234567832131319,
    createdAt: expect.any(Date),
  })
})

test('linkAccount fails when the credentials are invalid', async () => {
  const { telegramService } = sut()

  const linkAccountInput = {
    email: 'johndoe@email.com',
    password: 'wrongpassword',
    telegramId: 1234567832131319,
  }

  await expect(telegramService.linkAccount(linkAccountInput)).rejects.toThrow(
    new InvalidCredentialsError(),
  )
})

test('getUserIdByTelegramId returns the user id linked to the given telegram id', async () => {
  const { telegramService, createUser } = sut()

  const user = await createUser()

  await telegramService.linkAccount({
    email: user.email,
    password: '12345678',
    telegramId: 1234567832131319,
  })

  const userId = await telegramService.getUserIdByTelegramId({
    telegramId: 1234567832131319,
  })

  expect(userId).toStrictEqual({
    userId: user.id,
  })
})

test('getUserIdByTelegramId fails when there is no user linked to the given telegram id', async () => {
  const { telegramService } = sut()

  const result = await telegramService.getUserIdByTelegramId({
    telegramId: 1234567832131319,
  })

  expect(result).toBeNull()
})
