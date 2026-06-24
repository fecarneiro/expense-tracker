import { eq } from 'drizzle-orm'
import { beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
import { telegramLinkingCodesTable } from '../../../database/schemas/telegram-codes.schema.js'
import { usersTable } from '../../../database/schemas/user.schema.js'
import { setupDbTest } from '../../../tests/setup-db-test.js'
import { TelegramGenerateCodeFailedError } from './linking-code.error.js'
import { LinkingCodeRepository } from './linking-code.repository.js'
import {
  LINKING_CODE_GENERATION_MAX_ATTEMPTS,
  LINKING_CODE_MAX_NUMBER,
  LINKING_CODE_MIN_NUMBER,
  LinkingCodeService,
} from './linking-code.service.js'
import { LinkingCodeRateLimiter } from './linking-code-rate-limiter.js'

let dbTest: Database

beforeAll(async () => {
  const setup = await setupDbTest()
  dbTest = setup.dbTest as unknown as Database

  return async () => {
    setup.client.close()
  }
})

beforeEach(async () => {
  await dbTest.delete(telegramLinkingCodesTable)
  await dbTest.delete(usersTable)
})

function sut() {
  const container = createContainer(dbTest)
  const linkingCodeService = new LinkingCodeService(
    new LinkingCodeRepository(dbTest),
    new LinkingCodeRateLimiter(),
  )

  async function createUser(email = 'johndoe@email.com') {
    return container.authService.register({
      email,
      password: '12345678',
    })
  }

  return { linkingCodeService, createUser }
}

test('create creates and persists a linking code for an existing user', async () => {
  const { linkingCodeService, createUser } = sut()
  const user = await createUser()

  const linkingCode = await linkingCodeService.create({ userId: user.id })

  expect(linkingCode).toStrictEqual({
    code: expect.any(Number),
    createdAt: expect.any(Date),
  })
  expect(linkingCode.code).toBeGreaterThanOrEqual(LINKING_CODE_MIN_NUMBER)
  expect(linkingCode.code).toBeLessThan(LINKING_CODE_MAX_NUMBER)

  const [persistedLinkingCode] = await dbTest
    .select()
    .from(telegramLinkingCodesTable)
    .where(eq(telegramLinkingCodesTable.userId, user.id))

  expect(persistedLinkingCode).toStrictEqual({
    id: expect.any(String),
    userId: user.id,
    code: linkingCode.code,
    createdAt: linkingCode.createdAt,
  })
})

test('create replaces the linking code when called again for the same user', async () => {
  const { linkingCodeService, createUser } = sut()
  const user = await createUser()

  const firstLinkingCode = await linkingCodeService.create({ userId: user.id })
  const secondLinkingCode = await linkingCodeService.create({ userId: user.id })

  expect(secondLinkingCode.createdAt.getTime()).toBeGreaterThanOrEqual(
    firstLinkingCode.createdAt.getTime(),
  )

  const persistedLinkingCodes = await dbTest
    .select()
    .from(telegramLinkingCodesTable)
    .where(eq(telegramLinkingCodesTable.userId, user.id))

  expect(persistedLinkingCodes).toHaveLength(1)
  expect(persistedLinkingCodes[0]).toStrictEqual({
    id: expect.any(String),
    userId: user.id,
    code: secondLinkingCode.code,
    createdAt: secondLinkingCode.createdAt,
  })
})

test('create throws when all generation attempts fail', async () => {
  const { linkingCodeService, createUser } = sut()
  const user = await createUser()

  const saveLinkingCodeSpy = vi
    .spyOn(LinkingCodeRepository.prototype, 'saveLinkingCode')
    .mockResolvedValue({ saved: false })

  await expect(linkingCodeService.create({ userId: user.id })).rejects.toThrow(
    new TelegramGenerateCodeFailedError(),
  )

  expect(saveLinkingCodeSpy).toHaveBeenCalledTimes(LINKING_CODE_GENERATION_MAX_ATTEMPTS)
  saveLinkingCodeSpy.mockRestore()
})
