import type { DatabaseClient } from '../../../database/db.js'
import type { CategoryService } from '../../categories/category.service.js'
import { SHARED_CATEGORY_DEFAULTS } from './shared-category.defaults.js'
import { SharedCategoryNotFoundError } from './shared-category.errors.js'
import type { SharedCategoryRepository } from './shared-category.repository.js'
import type {
  CreateSharedCategoryMapping,
  SharedCategory,
  SharedCategoryMapping,
} from './shared-category.types.js'

export class SharedCategoryService {
  constructor(
    private readonly sharedCategoryRepository: SharedCategoryRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async mapUserCategoryToShared(
    input: CreateSharedCategoryMapping,
  ): Promise<SharedCategoryMapping> {
    const { userId, partnershipId, userCategoryId, sharedCategoryId } = input
    await this.categoryService.findById({
      id: userCategoryId,
      userId,
    })

    const sharedCategory = await this.sharedCategoryRepository.findSharedCategory({
      partnershipId,
      sharedCategoryId,
    })

    if (!sharedCategory) throw new SharedCategoryNotFoundError()

    const mappedCategory = await this.sharedCategoryRepository.createSharedCategoryMapping({
      userId,
      userCategoryId,
      sharedCategoryId,
    })

    return mappedCategory
  }

  async findPartnershipSharedCategories(partnershipId: string): Promise<SharedCategory[]> {
    return this.sharedCategoryRepository.findPartnershipSharedCategories(partnershipId)
  }

  // Internal use only
  async createDefaults(partnershipId: string, client: DatabaseClient) {
    const defaults = SHARED_CATEGORY_DEFAULTS.map((cat) => ({
      partnershipId,
      name: cat.name,
    }))

    await this.sharedCategoryRepository.createSharedCategories(defaults, client)
  }
}
