import { and, eq, isNull, or } from 'drizzle-orm/sql'
import type { Database, DatabaseClient } from '../../database/db.js'
import {
  partnershipsTable,
  sharedCategoriesTable,
} from '../../database/schemas/partnerships.schema.js'
import { PartnershipCreationError, SharedCategoriesCreationError } from './partnership.errors.js'
import type { Partnership } from './partnership.types.js'

export type PartnershipRow = typeof partnershipsTable.$inferSelect
export type NewPartnershipRow = typeof partnershipsTable.$inferInsert

export type SharedCategoryRow = typeof sharedCategoriesTable.$inferSelect
export type NewSharedCategoryRow = typeof sharedCategoriesTable.$inferInsert

export class PartnershipRepository {
  constructor(private readonly db: Database) {}

  async createPartnership(
    data: NewPartnershipRow,
    client: DatabaseClient = this.db,
  ): Promise<Partnership> {
    const [partnership] = await client.insert(partnershipsTable).values(data).returning()

    if (!partnership) {
      throw new PartnershipCreationError()
    }

    return partnership
  }

  async createSharedCategories(
    data: NewSharedCategoryRow[],
    client: DatabaseClient = this.db,
  ): Promise<SharedCategoryRow[]> {
    const created = await client.insert(sharedCategoriesTable).values(data).returning()

    if (created.length !== data.length) {
      throw new SharedCategoriesCreationError()
    }

    return created
  }

  async findUserActivePartnership(
    userId: string,
    client: DatabaseClient = this.db,
  ): Promise<PartnershipRow | null> {
    const [partnership] = await client
      .select()
      .from(partnershipsTable)
      .where(
        and(
          isNull(partnershipsTable.endedAt),
          or(eq(partnershipsTable.userAId, userId), eq(partnershipsTable.userBId, userId)),
        ),
      )

    return partnership ?? null
  }
}
