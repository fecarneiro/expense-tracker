import { eq } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import {
  type NewPartnershipCategoryRow,
  partnershipCategoriesTable,
} from '../../database/schemas/partnership-category.schema.js'
import type {
  FindManyByPartnershipIdInput,
  PartnershipCategory,
} from './partnership-category.service.js'

export class PartnershipCategoryRepository {
  constructor(private readonly database: Database) {}

  async createMany(categories: NewPartnershipCategoryRow[]): Promise<PartnershipCategory[]> {
    const values: NewPartnershipCategoryRow[] = categories.map((category) => ({
      partnershipId: category.partnershipId,
      name: category.name,
    }))

    return await this.database.insert(partnershipCategoriesTable).values(values).returning()
  }

  async findManyByPartnershipId(
    data: FindManyByPartnershipIdInput,
  ): Promise<PartnershipCategory[]> {
    return await this.database
      .select()
      .from(partnershipCategoriesTable)
      .where(eq(partnershipCategoriesTable.partnershipId, data.partnershipId))
  }
}
