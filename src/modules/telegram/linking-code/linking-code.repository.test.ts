import { eq } from 'drizzle-orm'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
import { telegramLinkingCodesTable } from '../../../database/schemas/telegram-codes.schema.js'
import { usersTable } from '../../../database/schemas/user.schema.js'
import { setupDbTest } from '../../../tests/db/setup-db-test.js'
import { LinkingCodeRepository } from './linking-code.repository.js'

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

  async function createUser(email = 'johndoe@email.com') {
    return container.authService.register({
      email,
      password: '12345678',
    })
  }

  return { createUser }
}

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
    .from(telegramLinkingCodesTable)
    .where(eq(telegramLinkingCodesTable.code, code))

  expect(persistedCodes).toHaveLength(1)
  expect(persistedCodes[0]).toMatchObject({ userId: firstUser.id, code })
})
