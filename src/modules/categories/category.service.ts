import type { DatabaseClient } from '../../database/db.js'
import { defaultCategories } from './category.defaults.js'
import { CategoryCreationFailedError, CategoryNotFoundError } from './category.error.js'
import type { CategoryRepository } from './category.repository.js'
import type {
  Category,
  CreateCategoryInput,
  CreateDefaultCategoriesInput,
  DeleteCategoryInput,
  FindAllCategoriesInput,
  FindCategoryByIdInput,
  FindCategoryByNameAndTypeInput,
  FindCategoryByTypeInput,
  UpdateCategoryInput,
} from './category.types.js'

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(data: CreateCategoryInput): Promise<Category> {
    const category = await this.categoryRepository.create(data)

    if (!category) {
      throw new CategoryCreationFailedError()
    }

    return category
  }

  async createDefaultsForUser(
    data: CreateDefaultCategoriesInput,
    dbClient?: DatabaseClient,
  ): Promise<Category[]> {
    const categories = await this.categoryRepository.createMany(
      {
        userId: data.userId,
        categories: defaultCategories,
      },
      dbClient,
    )

    if (categories.length !== defaultCategories.length) {
      throw new CategoryCreationFailedError()
    }

    return categories
  }

  async update(data: UpdateCategoryInput): Promise<Category> {
    const category = await this.categoryRepository.update(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    return category
  }

  async findById(data: FindCategoryByIdInput): Promise<Category> {
    const category = await this.categoryRepository.findById(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    return category
  }

  async findByType(data: FindCategoryByTypeInput): Promise<Category[]> {
    return this.categoryRepository.findByType(data)
  }

  async findByNameAndType(data: FindCategoryByNameAndTypeInput): Promise<Category | null> {
    // Does not throw because it is used only by Telegram bot flows.
    return this.categoryRepository.findByNameAndType(data)
  }

  async findAll(data: FindAllCategoriesInput): Promise<Category[]> {
    return this.categoryRepository.findAll(data)
  }

  async delete(data: DeleteCategoryInput): Promise<void> {
    const category = await this.categoryRepository.delete(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }
  }
}
