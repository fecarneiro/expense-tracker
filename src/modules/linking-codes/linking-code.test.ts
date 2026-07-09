import { eq } from 'drizzle-orm'
import { describe, vi } from 'vitest'
import type { Database } from '../../database/db.js'
import { linkingCodesTable } from '../../database/schemas/linking-codes.schema.js'
import { insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { LINKING_CODE } from './linking-code.constants.js'
import { LinkingCodeGenerationError } from './linking-code.error.js'
import { LinkingCodeRepository } from './linking-code.repository.js'
import { LinkingCodeService } from './linking-code.service.js'

function linkingCodeService(db: Database) {
  return new LinkingCodeService(new LinkingCodeRepository(db))
}

describe('LinkingCodeService', () => {
  describe('create', () => {
    test('creates and persists a linking code for an existing user', async ({ db }) => {
      const user = await insertTestUser(db)
      const service = linkingCodeService(db)

      const linkingCode = await service.create({ userId: user.id, purpose: 'bot_link' })

      expect(linkingCode).toStrictEqual({
        code: expect.any(Number),
        createdAt: expect.any(Date),
      })
      expect(linkingCode.code).toBeGreaterThanOrEqual(LINKING_CODE.MIN_NUMBER)
      expect(linkingCode.code).toBeLessThan(LINKING_CODE.MAX_NUMBER)

      const [persistedLinkingCode] = await db
        .select()
        .from(linkingCodesTable)
        .where(eq(linkingCodesTable.userId, user.id))

      expect(persistedLinkingCode).toStrictEqual({
        id: expect.any(String),
        userId: user.id,
        code: linkingCode.code,
        createdAt: linkingCode.createdAt,
        purpose: 'bot_link',
      })
    })

    test('replaces the linking code when called again for the same user', async ({ db }) => {
      const user = await insertTestUser(db)
      const service = linkingCodeService(db)

      const firstLinkingCode = await service.create({ userId: user.id, purpose: 'bot_link' })
      const secondLinkingCode = await service.create({ userId: user.id, purpose: 'bot_link' })

      expect(secondLinkingCode.createdAt.getTime()).toBeGreaterThanOrEqual(
        firstLinkingCode.createdAt.getTime(),
      )

      const persistedLinkingCodes = await db
        .select()
        .from(linkingCodesTable)
        .where(eq(linkingCodesTable.userId, user.id))

      expect(persistedLinkingCodes).toHaveLength(1)
      expect(persistedLinkingCodes[0]).toStrictEqual({
        id: expect.any(String),
        userId: user.id,
        code: secondLinkingCode.code,
        createdAt: secondLinkingCode.createdAt,
        purpose: 'bot_link',
      })
    })

    test('throws when all generation attempts fail', async ({ db }) => {
      const user = await insertTestUser(db)
      const service = linkingCodeService(db)

      const saveLinkingCodeSpy = vi
        .spyOn(LinkingCodeRepository.prototype, 'save')
        .mockResolvedValue({ saved: false })

      await expect(service.create({ userId: user.id, purpose: 'bot_link' })).rejects.toThrow(
        new LinkingCodeGenerationError(),
      )

      expect(saveLinkingCodeSpy).toHaveBeenCalledTimes(LINKING_CODE.GENERATION_MAX_ATTEMPTS)
      saveLinkingCodeSpy.mockRestore()
    })
  })
})
