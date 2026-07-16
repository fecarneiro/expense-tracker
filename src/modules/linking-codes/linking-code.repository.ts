import { and, eq, sql } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import {
  linkingCodesTable,
  type NewLinkingCodeRow,
} from '../../database/schemas/linking-codes.schema.js'
import type {
  DeleteLinkingCode,
  FindLinkingCode,
  SaveLinkingCodeResult,
} from './linking-code.types.js'

export class LinkingCodeRepository {
  constructor(private readonly database: Database) {}

  async save(data: NewLinkingCodeRow): Promise<SaveLinkingCodeResult> {
    try {
      const [generatedLinkingCode] = await this.database
        .insert(linkingCodesTable)
        .values(data)
        .onConflictDoUpdate({
          target: [linkingCodesTable.purpose, linkingCodesTable.userId],
          set: {
            code: data.code,
            createdAt: sql`now()`,
          },
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
      if (isUniqueViolation(err, 'linking_codes_unique')) {
        return { saved: false }
      }

      throw err
    }
  }

  async find(data: FindLinkingCode) {
    const [linkingCode] = await this.database
      .select()
      .from(linkingCodesTable)
      .where(
        and(eq(linkingCodesTable.code, data.code), eq(linkingCodesTable.purpose, data.purpose)),
      )

    return linkingCode ?? null
  }

  async delete(data: DeleteLinkingCode) {
    await this.database
      .delete(linkingCodesTable)
      .where(
        and(eq(linkingCodesTable.userId, data.userId), eq(linkingCodesTable.purpose, data.purpose)),
      )
  }
}
