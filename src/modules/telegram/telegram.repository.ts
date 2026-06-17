import { eq, sql } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import {
  type NewTelegram,
  type Telegram,
  telegramTable,
} from '../../database/schemas/telegram.schema.js'
import { telegramCodesTable } from '../../database/schemas/telegram-codes.schema.js'
import type { GetUserIdByTelegramIdData } from './telegram.dto.js'
import { TelegramAccountAlreadyExistsError } from './telegram.error.js'
import type { SaveLinkingCodeResult, SaveTelegramLinkingCode } from './telegram.types.js'

export class TelegramRepository {
  constructor(private readonly database: Database) {}

  async linkAccount(data: NewTelegram): Promise<Telegram | null> {
    try {
      const [telegram] = await this.database.insert(telegramTable).values(data).returning()

      return telegram ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_telegram_account_id')) {
        throw new TelegramAccountAlreadyExistsError()
      }
      throw err
    }
  }

  async saveLinkingCode(data: SaveTelegramLinkingCode): Promise<SaveLinkingCodeResult> {
    const { userId, code } = data

    try {
      const [generatedLinkingCode] = await this.database
        .insert(telegramCodesTable)
        .values({ userId, code })
        .onConflictDoUpdate({
          target: telegramCodesTable.userId,
          set: { code, createdAt: sql`now()` },
        })
        .returning({
          code: telegramCodesTable.code,
          createdAt: telegramCodesTable.createdAt,
        })

      if (!generatedLinkingCode) {
        return { saved: false }
      }

      return {
        saved: true as const,
        generatedLinkingCode,
      }
    } catch (err) {
      if (isUniqueViolation(err, 'unique_telegram_code')) {
        return { saved: false }
      }

      throw err
    }
  }

  async findUserIdByTelegramId(
    data: GetUserIdByTelegramIdData,
  ): Promise<Pick<Telegram, 'userId'> | null> {
    const [user] = await this.database
      .select({ userId: telegramTable.userId })
      .from(telegramTable)
      .where(eq(telegramTable.telegramId, data.telegramId))

    return user ?? null
  }
}
