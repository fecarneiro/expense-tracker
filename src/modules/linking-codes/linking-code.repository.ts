import { eq, sql } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import {
  linkingCodesTable,
  type NewLinkingCode,
} from '../../database/schemas/linking-codes.schema.js'
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
        .insert(linkingCodesTable)
        .values({ userId, code })
        .onConflictDoUpdate({
          target: linkingCodesTable.userId,
          set: { code, createdAt: sql`now()` },
        })
        .returning({
          code: linkingCodesTable.code,
          createdAt: linkingCodesTable.createdAt,
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
      .from(linkingCodesTable)
      .where(eq(linkingCodesTable.code, code))

    return user ?? null
  }

  async deleteByUserId(data: DeleteLinkingCodeByUserIdInput) {
    await this.database.delete(linkingCodesTable).where(eq(linkingCodesTable.userId, data.userId))
  }
}
