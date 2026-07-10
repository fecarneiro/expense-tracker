import { eq } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import {
  type NewSharedCategoryRow,
  sharedCategoriesTable,
} from '../../database/schemas/shared-category.schema.js'
import type { FindManyByConnectionIdInput, SharedCategory } from './shared_category.service.js'

export class SharedCategoryRepository {
  constructor(private readonly database: Database) {}

  async createMany(categories: NewSharedCategoryRow[]): Promise<SharedCategory[]> {
    const values: NewSharedCategoryRow[] = categories.map((category) => ({
      connectionId: category.connectionId,
      name: category.name,
    }))

    return await this.database.insert(sharedCategoriesTable).values(values).returning()
  }

  async findManyByConnectionId(data: FindManyByConnectionIdInput): Promise<SharedCategory[]> {
    return await this.database
      .select()
      .from(sharedCategoriesTable)
      .where(eq(sharedCategoriesTable.connectionId, data.connectionId))
  }
}
