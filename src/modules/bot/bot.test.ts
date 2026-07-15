import { eq } from 'drizzle-orm'
import { describe } from 'vitest'
import { linkingCodesTable } from '../../database/schemas/linking-codes.schema.js'
import { insertOtherTestUser, insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { BotAccountAlreadyExistsError } from './bot.error.js'

describe('BotService', () => {
  describe('findAccountByTelegramId', () => {
    test('returns null when no account is linked to the telegram id', async ({ container }) => {
      const telegramId = 1234567832131319

      const result = await container.botService.findAccountByTelegramId(telegramId)

      expect(result).toBeNull()
    })
  })

  describe('verifyAndLinkAccount', () => {
    test('links account and deletes the linking code on success', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const telegramId = 1234567890

      const { code } = await container.botService.createLinkingCode({
        userId: user.id,
        purpose: 'bot_link',
      })

      await container.botService.verifyAndLinkAccount({ telegramId, code, purpose: 'bot_link' })

      const botAccount = await container.botService.findAccountByTelegramId(telegramId)

      expect(botAccount).toStrictEqual({
        id: expect.any(String),
        userId: user.id,
        telegramId,
        createdAt: expect.any(Date),
      })

      const persistedLinkingCodes = await db
        .select()
        .from(linkingCodesTable)
        .where(eq(linkingCodesTable.userId, user.id))

      expect(persistedLinkingCodes).toHaveLength(0)
    })

    test('throws when the telegram id is already linked to another account', async ({
      container,
      db,
    }) => {
      const user1 = await insertTestUser(db)
      const user2 = await insertOtherTestUser(db)
      const telegramId = 1234567890

      const { code: user1Code } = await container.botService.createLinkingCode({
        userId: user1.id,
        purpose: 'bot_link',
      })

      await container.botService.verifyAndLinkAccount({
        telegramId,
        code: user1Code,
        purpose: 'bot_link',
      })

      const { code: user2Code } = await container.botService.createLinkingCode({
        userId: user2.id,
        purpose: 'bot_link',
      })

      await expect(
        container.botService.verifyAndLinkAccount({
          telegramId,
          code: user2Code,
          purpose: 'bot_link',
        }),
      ).rejects.toThrow(new BotAccountAlreadyExistsError())
    })
  })
})
