import { eq, sql } from 'drizzle-orm'
import { isUniqueViolation } from '../../../database/db.error.js'
import type { Database } from '../../../database/db.js'
import {
  type NewLinkingCode,
  telegramLinkingCodesTable,
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
        .insert(telegramLinkingCodesTable)
        .values({ userId, code })
        .onConflictDoUpdate({
          target: telegramLinkingCodesTable.userId,
          set: { code, createdAt: sql`now()` },
        })
        .returning({
          code: telegramLinkingCodesTable.code,
          createdAt: telegramLinkingCodesTable.createdAt,
        })

      if (!generatedLinkingCode) {
        return { saved: false }
      }

      return {
        saved: true as const,
        generatedLinkingCode,
      }
    } catch (err) {
      if (isUniqueViolation(err, 'telegram_linking_codes_unique')) {
        return { saved: false }
      }

      throw err
    }
  }

  async findByCode(data: FindLinkingCodeByCode) {
    const { code } = data

    const [user] = await this.database
      .select()
      .from(telegramLinkingCodesTable)
      .where(eq(telegramLinkingCodesTable.code, code))

    return user ?? null
  }

  async deleteByUserId(data: DeleteLinkingCodeByUserIdInput) {
    await this.database
      .delete(telegramLinkingCodesTable)
      .where(eq(telegramLinkingCodesTable.userId, data.userId))
  }
}
