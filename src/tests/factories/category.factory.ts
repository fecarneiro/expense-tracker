import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import type { CategoryType } from '../../modules/categories/category.types.js'

export const DEFAULT_CATEGORY_NAME = 'Eating Out'
export const DEFAULT_CATEGORY_TYPE = 'expense' as const

type InsertTestCategoryParams = {
  userId: string
  name?: string
  categoryType?: CategoryType
}

export async function insertTestCategory(db: Database, params: InsertTestCategoryParams) {
  const [category] = await db
    .insert(categoriesTable)
    .values({
      name: params.name ?? DEFAULT_CATEGORY_NAME,
      categoryType: params.categoryType ?? DEFAULT_CATEGORY_TYPE,
      userId: params.userId,
    })
    .returning()

  if (!category) throw new Error('insertTestCategory: failed')
  return category
}
