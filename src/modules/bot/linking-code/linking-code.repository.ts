import { eq, sql } from 'drizzle-orm'
import { isUniqueViolation } from '../../../database/db.error.js'
import type { Database } from '../../../database/db.js'
import {
  botLinkingCodesTable,
  type NewLinkingCode,
} from '../../../database/schemas/bot-codes.schema.js'
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
        .insert(botLinkingCodesTable)
        .values({ userId, code })
        .onConflictDoUpdate({
          target: botLinkingCodesTable.userId,
          set: { code, createdAt: sql`now()` },
        })
        .returning({
          code: botLinkingCodesTable.code,
          createdAt: botLinkingCodesTable.createdAt,
        })

      if (!generatedLinkingCode) {
        return { saved: false }
      }

      return {
        saved: true as const,
        generatedLinkingCode,
      }
    } catch (err) {
      if (isUniqueViolation(err, 'bot_linking_codes_unique')) {
        return { saved: false }
      }

      throw err
    }
  }

  async findByCode(data: FindLinkingCodeByCode) {
    const { code } = data

    const [user] = await this.database
      .select()
      .from(botLinkingCodesTable)
      .where(eq(botLinkingCodesTable.code, code))

    return user ?? null
  }

  async deleteByUserId(data: DeleteLinkingCodeByUserIdInput) {
    await this.database
      .delete(botLinkingCodesTable)
      .where(eq(botLinkingCodesTable.userId, data.userId))
  }
}
