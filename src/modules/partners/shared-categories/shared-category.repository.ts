import { and, eq } from 'drizzle-orm/sql'
import type { Database, DatabaseClient } from '../../../database/db.js'
import {
  type NewSharedCategoryMappingRow,
  type NewSharedCategoryRow,
  type SharedCategoryMappingRow,
  type SharedCategoryRow,
  sharedCategoriesMappingTable,
  sharedCategoriesTable,
} from '../../../database/schemas/partners/shared-categories.schema.js'
import {
  SharedCategoriesCreationError,
  SharedCategoryMappingError,
} from './shared-category.errors.js'

export type FindSharedCategory = {
  sharedCategoryId: string
  partnershipId: string
}

export class SharedCategoryRepository {
  constructor(private readonly db: Database) {}

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

  async findUserMappedCategory(
    userId: string,
    sharedCategoryId: string,
  ): Promise<SharedCategoryMappingRow | null> {
    const [mapped] = await this.db
      .select()
      .from(sharedCategoriesMappingTable)
      .where(
        and(
          eq(sharedCategoriesMappingTable.userId, userId),
          eq(sharedCategoriesMappingTable.sharedCategoryId, sharedCategoryId),
        ),
      )

    return mapped ?? null
  }
}
