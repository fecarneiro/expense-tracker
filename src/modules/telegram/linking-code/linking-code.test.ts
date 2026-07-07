import { eq } from 'drizzle-orm'
import { describe, vi } from 'vitest'
import type { Database } from '../../../database/db.js'
import { telegramLinkingCodesTable } from '../../../database/schemas/telegram-codes.schema.js'
import { insertTestUser } from '../../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../../tests/fixtures/integration.fixture.js'
import { TelegramGenerateCodeFailedError } from './linking-code.error.js'
import { LinkingCodeRepository } from './linking-code.repository.js'
import {
  LINKING_CODE_GENERATION_MAX_ATTEMPTS,
  LINKING_CODE_MAX_NUMBER,
  LINKING_CODE_MIN_NUMBER,
  LinkingCodeService,
} from './linking-code.service.js'
import { LinkingCodeRateLimiter } from './linking-code-rate-limiter.js'

function linkingCodeService(db: Database) {
  return new LinkingCodeService(new LinkingCodeRepository(db), new LinkingCodeRateLimiter())
}

describe('LinkingCodeService', () => {
  describe('create', () => {
    test('creates and persists a linking code for an existing user', async ({ db }) => {
      const user = await insertTestUser(db)
      const service = linkingCodeService(db)

      const linkingCode = await service.create({ userId: user.id })

      expect(linkingCode).toStrictEqual({
        code: expect.any(Number),
        createdAt: expect.any(Date),
      })
      expect(linkingCode.code).toBeGreaterThanOrEqual(LINKING_CODE_MIN_NUMBER)
      expect(linkingCode.code).toBeLessThan(LINKING_CODE_MAX_NUMBER)

      const [persistedLinkingCode] = await db
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

    test('replaces the linking code when called again for the same user', async ({ db }) => {
      const user = await insertTestUser(db)
      const service = linkingCodeService(db)

      const firstLinkingCode = await service.create({ userId: user.id })
      const secondLinkingCode = await service.create({ userId: user.id })

      expect(secondLinkingCode.createdAt.getTime()).toBeGreaterThanOrEqual(
        firstLinkingCode.createdAt.getTime(),
      )

      const persistedLinkingCodes = await db
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

    test('throws when all generation attempts fail', async ({ db }) => {
      const user = await insertTestUser(db)
      const service = linkingCodeService(db)

      const saveLinkingCodeSpy = vi
        .spyOn(LinkingCodeRepository.prototype, 'saveLinkingCode')
        .mockResolvedValue({ saved: false })

      await expect(service.create({ userId: user.id })).rejects.toThrow(
        new TelegramGenerateCodeFailedError(),
      )

      expect(saveLinkingCodeSpy).toHaveBeenCalledTimes(LINKING_CODE_GENERATION_MAX_ATTEMPTS)
      saveLinkingCodeSpy.mockRestore()
    })
  })
})
