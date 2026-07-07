import { eq } from 'drizzle-orm'
import { describe } from 'vitest'
import { botLinkingCodesTable } from '../../../database/schemas/bot-codes.schema.js'
import { insertOtherTestUser, insertTestUser } from '../../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../../tests/fixtures/integration.fixture.js'
import { LinkingCodeRepository } from './linking-code.repository.js'

describe('LinkingCodeRepository', () => {
  test('saveLinkingCode does not persist when the code is already used by another user', async ({
    db,
  }) => {
    const repository = new LinkingCodeRepository(db)

    const firstUser = await insertTestUser(db)
    const secondUser = await insertOtherTestUser(db)

    const code = 123_456

    const firstResult = await repository.saveLinkingCode({ userId: firstUser.id, code })
    expect(firstResult).toEqual({
      saved: true,
      generatedLinkingCode: { code, createdAt: expect.any(Date) },
    })

    const secondResult = await repository.saveLinkingCode({ userId: secondUser.id, code })
    expect(secondResult).toEqual({ saved: false })

    const persistedCodes = await db
      .select()
      .from(botLinkingCodesTable)
      .where(eq(botLinkingCodesTable.code, code))

    expect(persistedCodes).toHaveLength(1)
    expect(persistedCodes[0]).toMatchObject({ userId: firstUser.id, code })
  })
})
