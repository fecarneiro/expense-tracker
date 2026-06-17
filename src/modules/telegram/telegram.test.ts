import { eq } from 'drizzle-orm'
import { beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { telegramTable } from '../../database/schemas/telegram.schema.js'
import { telegramCodesTable } from '../../database/schemas/telegram-codes.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { InvalidCredentialsError } from '../auth/auth.error.js'
import { TelegramGenerateCodeFailedError } from './telegram.error.js'
import { TelegramRepository } from './telegram.repository.js'
import { MAX_ATTEMPTS, MAX_CODE, MIN_CODE } from './telegram.service.js'

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
  const container = createContainer(dbTest)

  async function createUser(email = 'johndoe@email.com') {
    return container.authService.register({
      email,
      password: '12345678',
    })
  }

  return { ...container, createUser }
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

test('createLinkingCode creates and persists a linking code for an existing user', async () => {
  const { telegramService, createUser } = sut()
  const user = await createUser()

  const linkingCode = await telegramService.createLinkingCode({ userId: user.id })

  expect(linkingCode).toStrictEqual({
    code: expect.any(Number),
    createdAt: expect.any(Date),
  })
  expect(linkingCode.code).toBeGreaterThanOrEqual(MIN_CODE)
  expect(linkingCode.code).toBeLessThan(MAX_CODE)

  const [persistedLinkingCode] = await dbTest
    .select()
    .from(telegramCodesTable)
    .where(eq(telegramCodesTable.userId, user.id))

  expect(persistedLinkingCode).toStrictEqual({
    id: expect.any(String),
    userId: user.id,
    code: linkingCode.code,
    createdAt: linkingCode.createdAt,
  })
})

test('createLinkingCode replaces the linking code when called again for the same user', async () => {
  const { telegramService, createUser } = sut()
  const user = await createUser()

  const firstLinkingCode = await telegramService.createLinkingCode({ userId: user.id })
  const secondLinkingCode = await telegramService.createLinkingCode({ userId: user.id })

  expect(secondLinkingCode.createdAt.getTime()).toBeGreaterThanOrEqual(
    firstLinkingCode.createdAt.getTime(),
  )

  const persistedLinkingCodes = await dbTest
    .select()
    .from(telegramCodesTable)
    .where(eq(telegramCodesTable.userId, user.id))

  expect(persistedLinkingCodes).toHaveLength(1)
  expect(persistedLinkingCodes[0]).toStrictEqual({
    id: expect.any(String),
    userId: user.id,
    code: secondLinkingCode.code,
    createdAt: secondLinkingCode.createdAt,
  })
})

test('createLinkingCode throws when all generation attempts fail', async () => {
  const { telegramService, createUser } = sut()
  const user = await createUser()

  const saveLinkingCodeSpy = vi
    .spyOn(TelegramRepository.prototype, 'saveLinkingCode')
    .mockResolvedValue({ saved: false })

  await expect(telegramService.createLinkingCode({ userId: user.id })).rejects.toThrow(
    new TelegramGenerateCodeFailedError(),
  )

  expect(saveLinkingCodeSpy).toHaveBeenCalledTimes(MAX_ATTEMPTS)
  saveLinkingCodeSpy.mockRestore()
})

test('saveLinkingCode does not persist when the code is already used by another user', async () => {
  const { createUser } = sut()
  const repository = new TelegramRepository(dbTest)

  const firstUser = await createUser()
  const secondUser = await createUser('jane@email.com')

  const code = 123_456

  const firstResult = await repository.saveLinkingCode({ userId: firstUser.id, code })
  expect(firstResult).toEqual({
    saved: true,
    generatedLinkingCode: { code, createdAt: expect.any(Date) },
  })

  const secondResult = await repository.saveLinkingCode({ userId: secondUser.id, code })
  expect(secondResult).toEqual({ saved: false })

  const persistedCodes = await dbTest
    .select()
    .from(telegramCodesTable)
    .where(eq(telegramCodesTable.code, code))

  expect(persistedCodes).toHaveLength(1)
  expect(persistedCodes[0]).toMatchObject({ userId: firstUser.id, code })
})
