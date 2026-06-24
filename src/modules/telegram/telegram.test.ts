import { eq } from 'drizzle-orm'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { telegramAccountsTable } from '../../database/schemas/telegram-accounts.schema.js'
import { telegramLinkingCodesTable } from '../../database/schemas/telegram-codes.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
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
  await dbTest.delete(telegramLinkingCodesTable)
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
    .from(telegramLinkingCodesTable)
    .where(eq(telegramLinkingCodesTable.userId, user.id))

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
