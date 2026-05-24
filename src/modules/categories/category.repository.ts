import { and, eq } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { CategoryAlreadyExistsError } from './category.error.js'
import type {
  Category,
  CreateCategory,
  DeleteCategory,
  FindAllCategoryByUserId,
  FindCategoryById,
  UpdateCategory,
} from './category.types.js'

export class CategoryRepository {
  constructor(private readonly database: Database) {}

  async create(data: CreateCategory): Promise<Category | null> {
    try {
      const [category] = await this.database
        .insert(categoriesTable)
        .values(data)
        .returning()

      return category ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_category_name')) {
        throw new CategoryAlreadyExistsError()
      }
      throw err
    }
  }

  async update(data: UpdateCategory): Promise<Category | null> {
    try {
      const [category] = await this.database
        .update(categoriesTable)
        .set({ name: data.name })
        .where(
          and(
            eq(categoriesTable.id, data.id),
            eq(categoriesTable.userId, data.userId),
          ),
        )
        .returning()

      return category ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_category_name')) {
        throw new CategoryAlreadyExistsError()
      }
      throw err
    }
  }

  async findById(data: FindCategoryById): Promise<Category | null> {
    const [categories] = await this.database
      .select()
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, data.id),
          eq(categoriesTable.userId, data.userId),
        ),
      )

    return categories ?? null
  }

  async findAll(data: FindAllCategoryByUserId): Promise<Category[]> {
    const categories = await this.database
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, data.userId))

    return categories
  }

  async delete(data: DeleteCategory): Promise<void> {
    await this.database
      .delete(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, data.id),
          eq(categoriesTable.userId, data.userId),
        ),
      )
  }
}
