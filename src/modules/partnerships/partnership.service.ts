import type { LinkingCodeService } from '../linking-codes/linking-code.service.js'
import type { GeneratedLinkingCode } from '../linking-codes/linking-code.types.js'
import { defaultPartnershipCategories } from '../partnership-categories/partnership-category.defaults.js'
import type { PartnershipCategoryService } from '../partnership-categories/partnership-category.service.js'
import { PartnershipCreationError } from './partnership.error.js'
import type { PartnershipRepository } from './partnership.repository.js'
import type { Partnership } from './partnership.types.js'

export type CreatePartnershipInput = {
  userId: string
  code: number
}

export type GeneratePartnershipCodeInput = {
  userId: string
}

export class PartnershipService {
  constructor(
    private readonly partnershipsRepository: PartnershipRepository,
    private readonly linkingCodeService: LinkingCodeService,
    private readonly partnershipCategoryService: PartnershipCategoryService,
  ) {}

  async generatePartnershipCode(data: GeneratePartnershipCodeInput): Promise<GeneratedLinkingCode> {
    const generatedLinkingCode = await this.linkingCodeService.create({
      userId: data.userId,
      purpose: 'user_link',
    })

    return {
      code: generatedLinkingCode.code,
      createdAt: generatedLinkingCode.createdAt,
    }
  }

  async create(data: CreatePartnershipInput): Promise<Partnership | null> {
    const { userId: userIdFromCode } = await this.linkingCodeService.verify({
      code: data.code,
      purpose: 'user_link',
    })

    const partnership = await this.partnershipsRepository.create({
      userAId: userIdFromCode,
      userBId: data.userId,
    })

    if (!partnership) {
      throw new PartnershipCreationError()
    }

    await this.partnershipCategoryService.createMany(
      defaultPartnershipCategories.map((cat) => ({
        partnershipId: partnership.id,
        name: cat.name,
      })),
    )

    return partnership
  }
}
