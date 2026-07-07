import type { DatabaseClient } from '../../database/db.js'
import { defaultCategories } from './category.defaults.js'
import { CategoryCreationFailedError, CategoryNotFoundError } from './category.error.js'
import {
  type CategoryResponse,
  toCategoriesResponse,
  toCategoryResponse,
} from './category.mapper.js'
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

  async create(data: CreateCategoryInput): Promise<CategoryResponse> {
    const category = await this.categoryRepository.create(data)

    if (!category) {
      throw new CategoryCreationFailedError()
    }

    return toCategoryResponse(category)
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

  async update(data: UpdateCategoryInput): Promise<CategoryResponse> {
    const category = await this.categoryRepository.update(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    return toCategoryResponse(category)
  }

  async findById(data: FindCategoryByIdInput): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findById(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    return toCategoryResponse(category)
  }

  async findByType(data: FindCategoryByTypeInput): Promise<CategoryResponse[]> {
    const categories = await this.categoryRepository.findByType(data)
    return toCategoriesResponse(categories)
  }

  async findByNameAndType(data: FindCategoryByNameAndTypeInput): Promise<Category | null> {
    // Does not throw because it is used only by Telegram bot flows.
    return this.categoryRepository.findByNameAndType(data)
  }

  async findAll(data: FindAllCategoriesInput): Promise<CategoryResponse[]> {
    const categories = await this.categoryRepository.findAll(data)
    return toCategoriesResponse(categories)
  }

  async delete(data: DeleteCategoryInput): Promise<void> {
    const category = await this.categoryRepository.delete(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }
  }
}
