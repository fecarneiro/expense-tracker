import { and, eq, isNull, sql } from 'drizzle-orm'
import { isForeignKeyViolation, isUniqueViolation } from '../../database/db.error.js'
import type { Database, DatabaseClient } from '../../database/db.js'
import {
  type CategoryRow,
  categoriesTable,
  type NewCategoryRow,
} from '../../database/schemas/categories.schema.js'
import type { CategorySystemDefaultsInput } from './category.defaults.js'
import {
  CategoryAlreadyExistsError,
  CategoryInUseError,
  CategorySystemProtectedError,
} from './category.error.js'
import type {
  Category,
  CreateCategoryInput,
  DeleteCategoryInput,
  DeletedCategory,
  FindAllCategoriesInput,
  FindCategoryByIdInput,
  FindCategoryByNameAndTypeInput,
  FindCategoryBySystemKeyInput,
  FindCategoryByTypeInput,
  UpdateCategoryInput,
} from './category.types.js'

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    categoryType: row.categoryType,
    createdAt: row.createdAt,
  }
}

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

      return category ? toCategory(category) : null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_category_name_type')) {
        throw new CategoryAlreadyExistsError()
      }

      throw err
    }
  }

  async createSystemDefaults(
    data: CategorySystemDefaultsInput,
    dbClient: DatabaseClient = this.database,
  ): Promise<Category[]> {
    const values: NewCategoryRow[] = data.categories.map((category) => ({
      userId: data.userId,
      name: category.name,
      categoryType: category.categoryType,
      systemKey: category.systemKey,
    }))

    try {
      const rows = await dbClient.insert(categoriesTable).values(values).returning()
      return rows.map(toCategory)
    } catch (err) {
      if (
        isUniqueViolation(err, 'unique_category_name_type') ||
        isUniqueViolation(err, 'unique_category_user_system_key')
      ) {
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
        .where(
          and(
            eq(categoriesTable.id, id),
            eq(categoriesTable.userId, userId),
            isNull(categoriesTable.systemKey),
          ),
        )
        .returning()

      if (category) {
        return toCategory(category)
      }

      const [existing] = await this.database
        .select()
        .from(categoriesTable)
        .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)))

      if (existing?.systemKey != null) {
        throw new CategorySystemProtectedError()
      }

      return null
    } catch (err) {
      if (err instanceof CategorySystemProtectedError) {
        throw err
      }
      if (isUniqueViolation(err, 'unique_category_name_type')) {
        throw new CategoryAlreadyExistsError()
      }

      throw err
    }
  }

  async findById(data: FindCategoryByIdInput): Promise<Category | null> {
    const [row] = await this.database
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, data.id), eq(categoriesTable.userId, data.userId)))

    return row ? toCategory(row) : null
  }

  async findBySystemKey(data: FindCategoryBySystemKeyInput): Promise<Category | null> {
    const [row] = await this.database
      .select()
      .from(categoriesTable)
      .where(
        and(eq(categoriesTable.userId, data.userId), eq(categoriesTable.systemKey, data.systemKey)),
      )

    return row ? toCategory(row) : null
  }

  async findByType(data: FindCategoryByTypeInput): Promise<Category[]> {
    const rows = await this.database
      .select()
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.userId, data.userId),
          eq(categoriesTable.categoryType, data.categoryType),
        ),
      )

    return rows.map(toCategory)
  }

  async findByNameAndType(data: FindCategoryByNameAndTypeInput): Promise<Category | null> {
    const [row] = await this.database
      .select()
      .from(categoriesTable)
      .where(
        and(
          eq(sql`lower(${categoriesTable.name})`, sql`lower(${data.name})`),
          eq(categoriesTable.categoryType, data.categoryType),
          eq(categoriesTable.userId, data.userId),
        ),
      )

    return row ? toCategory(row) : null
  }

  async findAll(data: FindAllCategoriesInput): Promise<Category[]> {
    const rows = await this.database
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, data.userId))

    return rows.map(toCategory)
  }

  async delete(data: DeleteCategoryInput): Promise<DeletedCategory | null> {
    try {
      const [category] = await this.database
        .delete(categoriesTable)
        .where(
          and(
            eq(categoriesTable.id, data.id),
            eq(categoriesTable.userId, data.userId),
            isNull(categoriesTable.systemKey),
          ),
        )
        .returning({ id: categoriesTable.id })

      if (category) {
        return category
      }

      const [existing] = await this.database
        .select()
        .from(categoriesTable)
        .where(and(eq(categoriesTable.id, data.id), eq(categoriesTable.userId, data.userId)))

      if (existing?.systemKey != null) {
        throw new CategorySystemProtectedError()
      }

      return null
    } catch (err) {
      if (err instanceof CategorySystemProtectedError) {
        throw err
      }
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryInUseError()
      }

      throw err
    }
  }
}
