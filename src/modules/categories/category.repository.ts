import { and, eq, sql } from 'drizzle-orm'
import { isForeignKeyViolation, isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import { categoriesTable, type NewCategoryRow } from '../../database/schemas/category.schema.js'
import { CategoryAlreadyExistsError, CategoryInUseError } from './category.error.js'
import type {
  Category,
  CreateCategoryInput,
  DeleteCategoryInput,
  DeletedCategory,
  FindAllCategoriesInput,
  FindCategoryByIdInput,
  FindCategoryByNameInput,
  UpdateCategoryInput,
} from './category.types.js'

export class CategoryRepository {
  constructor(private readonly database: Database) {}

  async create(data: CreateCategoryInput): Promise<Category | null> {
    const values: NewCategoryRow = {
      userId: data.userId,
      name: data.name,
      categoryType: data.categoryType,
    }

    try {
      const [category] = await this.database.insert(categoriesTable).values(values).returning()

      return category ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_category_name_type')) {
        throw new CategoryAlreadyExistsError()
      }

      throw err
    }
  }

  async update(data: UpdateCategoryInput): Promise<Category | null> {
    const { id, userId, ...updateData } = data

    try {
      const [category] = await this.database
        .update(categoriesTable)
        .set(updateData)
        .where(and(eq(categoriesTable.id, data.id), eq(categoriesTable.userId, data.userId)))
        .returning()

      return category ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_category_name_type')) {
        throw new CategoryAlreadyExistsError()
      }

      throw err
    }
  }

  async findById(data: FindCategoryByIdInput): Promise<Category | null> {
    const [category] = await this.database
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, data.id), eq(categoriesTable.userId, data.userId)))

    return category ?? null
  }

  async findByName(data: FindCategoryByNameInput): Promise<Category | null> {
    const [category] = await this.database
      .select()
      .from(categoriesTable)
      .where(
        and(
          eq(sql`lower(${categoriesTable.name})`, sql`lower(${data.name})`),
          eq(categoriesTable.userId, data.userId),
        ),
      )

    return category ?? null
  }

  async findAll(data: FindAllCategoriesInput): Promise<Category[]> {
    return this.database
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, data.userId))
  }

  async delete(data: DeleteCategoryInput): Promise<DeletedCategory | null> {
    try {
      const [category] = await this.database
        .delete(categoriesTable)
        .where(and(eq(categoriesTable.id, data.id), eq(categoriesTable.userId, data.userId)))
        .returning({ id: categoriesTable.id })

      return category ?? null
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryInUseError()
      }

      throw err
    }
  }
}
