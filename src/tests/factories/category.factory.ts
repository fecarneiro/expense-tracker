import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { insertTestUser } from './user.factory.js'

export const DEFAULT_CATEGORY_NAME = 'Eating Out'
export const DEFAULT_CATEGORY_TYPE = 'expense' as const

type InsertTestCategoryParams = {
  userId: string
  name?: string
  categoryType?: 'income' | 'expense'
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

export async function insertUserWithCategory(db: Database) {
  const user = await insertTestUser(db)
  const category = await insertTestCategory(db, { userId: user.id })
  return { user, category }
}
