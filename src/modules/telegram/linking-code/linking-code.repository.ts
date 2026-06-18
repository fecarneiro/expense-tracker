import { eq, sql } from 'drizzle-orm'
import { isUniqueViolation } from '../../../database/db.error.js'
import type { Database } from '../../../database/db.js'
import {
  type NewLinkingCode,
  telegramCodesTable,
} from '../../../database/schemas/telegram-codes.schema.js'
import type {
  DeleteLinkingCodeByUserIdInput,
  FindLinkingCodeByCode,
  SaveLinkingCodeResult,
} from './linking-code.types.js'

export class LinkingCodeRepository {
  constructor(private readonly database: Database) {}

  async saveLinkingCode(data: NewLinkingCode): Promise<SaveLinkingCodeResult> {
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

  async findByCode(data: FindLinkingCodeByCode) {
    const { code } = data

    const [user] = await this.database
      .select()
      .from(telegramCodesTable)
      .where(eq(telegramCodesTable.code, code))

    return user ?? null
  }

  async deleteByUserId(data: DeleteLinkingCodeByUserIdInput) {
    await this.database.delete(telegramCodesTable).where(eq(telegramCodesTable.userId, data.userId))
  }
}
