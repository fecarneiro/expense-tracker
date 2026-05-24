import {
  CategoryCreationFailedError,
  CategoryNotFoundError,
} from './category.error.js'
import type { CategoryRepository } from './category.repository.js'
import type {
  Category,
  CreateCategory,
  DeleteCategory,
  FindAllCategoryByUserId,
  FindCategoryById,
  UpdateCategory,
} from './category.types.js'

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(data: CreateCategory): Promise<Category> {
    const newCategory = await this.categoryRepository.create(data)

    if (!newCategory) {
      throw new CategoryCreationFailedError()
    }

    return newCategory
  }

  async update(data: UpdateCategory): Promise<Category> {
    const updated = await this.categoryRepository.update(data)

    if (!updated) {
      throw new CategoryNotFoundError()
    }

    return updated
  }

  async findById(data: FindCategoryById): Promise<Category> {
    const category = await this.categoryRepository.findById(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    return category
  }

  async findAll(data: FindAllCategoryByUserId): Promise<Category[]> {
    return await this.categoryRepository.findAll(data)
  }

  async delete(data: DeleteCategory): Promise<void> {
    return await this.categoryRepository.delete(data)
  }
}
