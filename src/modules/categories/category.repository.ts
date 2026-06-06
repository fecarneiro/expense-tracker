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
  type PublicCategory,
} from '../../database/schemas/category.schema.js'
import type {
  DeleteCategoryInput,
  FindAllCategoriesInput,
  FindCategoryByIdInput,
  FindCategoryByNameData,
  UpdateCategoryInput,
} from './category.dto.js'
import {
  CategoryAlreadyExistsError,
  CategoryInUseError,
} from './category.error.js'

const publicCategoriesTableColumns = {
  id: categoriesTable.id,
  name: categoriesTable.name,
  createdAt: categoriesTable.createdAt,
}

export class CategoryRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewCategory): Promise<PublicCategory | null> {
    try {
      const [category] = await this.database
        .insert(categoriesTable)
        .values(data)
        .returning(publicCategoriesTableColumns)

      return category ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_category_name')) {
        throw new CategoryAlreadyExistsError()
      }
      throw err
    }
  }

  async update(data: UpdateCategoryInput): Promise<PublicCategory | null> {
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
        .returning(publicCategoriesTableColumns)

      return category ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_category_name')) {
        throw new CategoryAlreadyExistsError()
      }
      throw err
    }
  }

  async findById(data: FindCategoryByIdInput): Promise<PublicCategory | null> {
    const [category] = await this.database
      .select(publicCategoriesTableColumns)
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, data.id),
          eq(categoriesTable.userId, data.userId),
        ),
      )

    return category ?? null
  }

  async findByName(
    data: FindCategoryByNameData,
  ): Promise<PublicCategory | null> {
    const [category] = await this.database
      .select(publicCategoriesTableColumns)
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.name, data.name),
          eq(categoriesTable.userId, data.userId),
        ),
      )

    return category ?? null
  }

  async findAll(data: FindAllCategoriesInput): Promise<PublicCategory[]> {
    const categories = await this.database
      .select(publicCategoriesTableColumns)
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
