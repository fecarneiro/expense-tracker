import { and, eq } from 'drizzle-orm'
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import {
  type Category,
  categoriesTable,
  type NewCategory,
} from './category.entity.js'
import {
  CategoryAlreadyExistsError,
  CategoryInUseError,
} from './category.error.js'
import type {
  DeleteCategoryInput,
  FindAllCategoriesInput,
  FindCategoryByIdInput,
  UpdateCategoryInput,
} from './category.schemas.js'

export class CategoryRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewCategory): Promise<Category | null> {
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

  async update(data: UpdateCategoryInput): Promise<Category | null> {
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

  async findById(data: FindCategoryByIdInput): Promise<Category | null> {
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

  async findAll(data: FindAllCategoriesInput): Promise<Category[]> {
    const categories = await this.database
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, data.userId))

    return categories
  }

  async delete(
    data: DeleteCategoryInput,
  ): Promise<Pick<Category, 'id'> | null> {
    try {
      const [category] = await this.database
        .delete(categoriesTable)
        .where(
          and(
            eq(categoriesTable.id, data.id),
            eq(categoriesTable.userId, data.userId),
          ),
        )
        .returning({ id: categoriesTable.id })

      if (!category) return null

      return category
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryInUseError()
      }

      throw err
    }
  }
}
