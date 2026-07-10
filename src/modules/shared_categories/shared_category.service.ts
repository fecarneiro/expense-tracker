import type { NewSharedCategoryRow } from '../../database/schemas/shared-category.schema.js'
import type { SharedCategoryRepository } from './shared_category.repository.js'

export type SharedCategory = NewSharedCategoryRow
export type FindManyByConnectionIdInput = Pick<SharedCategory, 'connectionId'>

export class SharedCategoryService {
  constructor(private readonly sharedCategoryRepository: SharedCategoryRepository) {}

  async createMany(data: SharedCategory[]): Promise<SharedCategory[]> {
    return await this.sharedCategoryRepository.createMany(data)
  }

  async findManyByConnectionId(data: FindManyByConnectionIdInput): Promise<SharedCategory[]> {
    return await this.sharedCategoryRepository.findManyByConnectionId({
      connectionId: data.connectionId,
    })
  }
}
