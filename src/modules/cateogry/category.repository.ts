import { eq } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import {
  type Category,
  categoriesTable,
  type NewCategory,
} from '../../database/schemas/category.schema.js'

export class CategoryRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewCategory): Promise<Category | null> {
    const [category] = await this.database
      .insert(categoriesTable)
      .values(data)
      .returning()

    return category ?? null
  }

  async findById(id: string): Promise<Category | null> {
    const [categories] = await this.database
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id))

    return categories ?? null
  }

  async findAll(userId: string): Promise<Category[] | null> {
    const categories = await this.database
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, userId))

    return categories ?? null
  }

  async delete(id: string) {
    await this.database
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, id))
  }
}
