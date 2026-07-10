import type { NewPartnershipCategoryRow } from '../../database/schemas/partnership-category.schema.js'
import type { PartnershipCategoryRepository } from './partnership-category.repository.js'

export type PartnershipCategory = NewPartnershipCategoryRow
export type FindManyByPartnershipIdInput = Pick<PartnershipCategory, 'partnershipId'>

export class PartnershipCategoryService {
  constructor(private readonly partnershipCategoryRepository: PartnershipCategoryRepository) {}

  async createMany(data: PartnershipCategory[]): Promise<PartnershipCategory[]> {
    return await this.partnershipCategoryRepository.createMany(data)
  }

  async findManyByPartnershipId(
    data: FindManyByPartnershipIdInput,
  ): Promise<PartnershipCategory[]> {
    return await this.partnershipCategoryRepository.findManyByPartnershipId({
      partnershipId: data.partnershipId,
    })
  }
}
