import { and, eq, isNull, or } from 'drizzle-orm/sql'
import type { Database, DatabaseClient } from '../../database/db.js'
import {
  partnershipsTable,
  sharedCategoriesMappingTable,
  sharedCategoriesTable,
} from '../../database/schemas/partnerships.schema.js'
import {
  PartnershipCreationError,
  SharedCategoriesCreationError,
  SharedCategoryMappingError,
} from './partnership.errors.js'
import type { Partnership } from './partnership.types.js'

export type PartnershipRow = typeof partnershipsTable.$inferSelect
export type NewPartnershipRow = typeof partnershipsTable.$inferInsert
export type SharedCategoryRow = typeof sharedCategoriesTable.$inferSelect
export type NewSharedCategoryRow = typeof sharedCategoriesTable.$inferInsert
export type FindSharedCategory = {
  sharedCategoryId: string
  partnershipId: string
}
export type SharedCategoryMappingRow = typeof sharedCategoriesMappingTable.$inferSelect
export type NewSharedCategoryMappingRow = typeof sharedCategoriesMappingTable.$inferInsert

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

  async findSharedCategory(input: FindSharedCategory): Promise<SharedCategoryRow | null> {
    const { sharedCategoryId, partnershipId } = input

    const [category] = await this.db
      .select()
      .from(sharedCategoriesTable)
      .where(
        and(
          eq(sharedCategoriesTable.id, sharedCategoryId),
          eq(sharedCategoriesTable.partnershipId, partnershipId),
        ),
      )
    return category ?? null
  }

  async createSharedCategoryMapping(
    data: NewSharedCategoryMappingRow,
  ): Promise<SharedCategoryMappingRow> {
    const [mapped] = await this.db.insert(sharedCategoriesMappingTable).values(data).returning()

    if (!mapped) {
      throw new SharedCategoryMappingError()
    }

    return mapped
  }
}
