import { type PublicCategory, toPublicCategory } from './category.entity.js'
import {
  CategoryCreationFailedError,
  CategoryNotFoundError,
} from './category.error.js'
import type { CategoryRepository } from './category.repository.js'
import type {
  CreateCategoryInput,
  DeleteCategoryInput,
  FindAllCategoriesInput,
  FindCategoryByIdInput,
  UpdateCategoryInput,
} from './category.schemas.js'

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(data: CreateCategoryInput): Promise<PublicCategory> {
    const category = await this.categoryRepository.create(data)

    if (!category) {
      throw new CategoryCreationFailedError()
    }

    return toPublicCategory(category)
  }

  async update(data: UpdateCategoryInput): Promise<PublicCategory> {
    const category = await this.categoryRepository.update(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    return toPublicCategory(category)
  }

  async findById(data: FindCategoryByIdInput): Promise<PublicCategory> {
    const category = await this.categoryRepository.findById(data)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    return toPublicCategory(category)
  }

  async findAll(data: FindAllCategoriesInput): Promise<PublicCategory[]> {
    const categories = await this.categoryRepository.findAll(data)
    return categories.map((c) => toPublicCategory(c))
  }

  async delete(data: DeleteCategoryInput): Promise<void> {
    const category = await this.categoryRepository.delete(data)

    if (!category) throw new CategoryNotFoundError()
  }
}
