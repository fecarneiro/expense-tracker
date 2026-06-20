import { eq } from 'drizzle-orm'
import { beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { telegramAccountsTable } from '../../database/schemas/telegram-accounts.schema.js'
import { telegramCodesTable } from '../../database/schemas/telegram-codes.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { TelegramGenerateCodeFailedError } from './linking-code/linking-code.error.js'
import { LinkingCodeRepository } from './linking-code/linking-code.repository.js'
import {
  LINKING_CODE_GENERATION_MAX_ATTEMPTS,
  LINKING_CODE_MAX_NUMBER,
  LINKING_CODE_MIN_NUMBER,
} from './linking-code/linking-code.service.js'
import { TelegramAccountAlreadyExistsError } from './telegram.error.js'

let dbTest: Database

beforeAll(async () => {
  const setup = await setupDbTest()
  dbTest = setup.dbTest as unknown as Database

  return async () => {
    setup.client.close()
  }
})

beforeEach(async () => {
  await dbTest.delete(telegramAccountsTable)
  await dbTest.delete(telegramCodesTable)
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

test('findAccountByTelegramId fails when there is no user linked to the given telegram id', async () => {
  const { telegramService } = sut()

  const result = await telegramService.findAccountByTelegramId({
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
  expect(linkingCode.code).toBeGreaterThanOrEqual(LINKING_CODE_MIN_NUMBER)
  expect(linkingCode.code).toBeLessThan(LINKING_CODE_MAX_NUMBER)

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
    .spyOn(LinkingCodeRepository.prototype, 'saveLinkingCode')
    .mockResolvedValue({ saved: false })

  await expect(telegramService.createLinkingCode({ userId: user.id })).rejects.toThrow(
    new TelegramGenerateCodeFailedError(),
  )

  expect(saveLinkingCodeSpy).toHaveBeenCalledTimes(LINKING_CODE_GENERATION_MAX_ATTEMPTS)
  saveLinkingCodeSpy.mockRestore()
})

test('saveLinkingCode does not persist when the code is already used by another user', async () => {
  const { createUser } = sut()
  const repository = new LinkingCodeRepository(dbTest)

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

test('verifyAndLinkAccount links account and deletes the linking code on success', async () => {
  const { telegramService, createUser } = sut()
  const user = await createUser()
  const telegramId = 1234567890

  const { code } = await telegramService.createLinkingCode({ userId: user.id })

  await telegramService.verifyAndLinkAccount({ telegramId, code })

  const telegramAccount = await telegramService.findAccountByTelegramId({ telegramId })

  expect(telegramAccount).toStrictEqual({
    id: expect.any(String),
    userId: user.id,
    telegramId,
    createdAt: expect.any(Date),
  })

  const persistedLinkingCodes = await dbTest
    .select()
    .from(telegramCodesTable)
    .where(eq(telegramCodesTable.userId, user.id))

  expect(persistedLinkingCodes).toHaveLength(0)
})

test('verifyAndLinkAccount throws when the telegramId is already linked to another account', async () => {
  const { telegramService, createUser } = sut()
  const user1 = await createUser()
  const user2 = await createUser('janejoe@email.com')
  const telegramId = 1234567890

  const { code: user1Code } = await telegramService.createLinkingCode({ userId: user1.id })

  await telegramService.verifyAndLinkAccount({ telegramId, code: user1Code })

  const { code: user2Code } = await telegramService.createLinkingCode({ userId: user2.id })

  await expect(
    telegramService.verifyAndLinkAccount({ telegramId, code: user2Code }),
  ).rejects.toThrow(new TelegramAccountAlreadyExistsError())
})
