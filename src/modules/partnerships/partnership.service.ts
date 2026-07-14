import type { Database, DatabaseClient } from '../../database/db.js'
import type { CategoryService } from '../categories/category.service.js'
import type { LinkingCodeService } from '../linking-codes/linking-code.service.js'
import { SHARED_CATEGORY_DEFAULTS } from './partnership.defaults.js'
import {
  CannotPartnerWithYourselfError,
  InviteeAlreadyHasActivePartnership,
  InviterAlreadyHasActivePartnership,
  SharedCategoryNotFoundError,
} from './partnership.errors.js'
import type { PartnershipRepository } from './partnership.repository.js'
import type { Partnership, SharedCategoryMapping } from './partnership.types.js'

export type CreatePartnership = {
  inviteeId: string
  code: number
}
export type CreateSharedCategoryMapping = {
  userId: string
  partnershipId: string
  userCategoryId: string
  sharedCategoryId: string
}

export class PartnershipService {
  constructor(
    private readonly linkingCodeService: LinkingCodeService,
    private readonly partnershipRepository: PartnershipRepository,
    private readonly categoryService: CategoryService,
    private readonly db: Database,
  ) {}

  async createPartnership(data: CreatePartnership): Promise<Partnership> {
    const { inviteeId, code } = data

    const { userId: inviterId } = await this.linkingCodeService.verify({
      code,
      purpose: 'partnership_link',
    })

    if (inviterId === inviteeId) {
      throw new CannotPartnerWithYourselfError()
    }

    if (await this.hasActivePartnership(inviteeId)) {
      throw new InviteeAlreadyHasActivePartnership()
    }

    if (await this.hasActivePartnership(inviterId)) {
      throw new InviterAlreadyHasActivePartnership()
    }
    const { userAId, userBId } = this.toCanonicalUserPair(inviterId, inviteeId)

    return await this.db.transaction(async (tx) => {
      const partnership = await this.partnershipRepository.createPartnership(
        { userAId, userBId },
        tx,
      )
      await this.createDefaultSharedCategories(partnership.id, tx)

      return partnership
    })
  }

  async mapUserCategoryToShared(
    input: CreateSharedCategoryMapping,
  ): Promise<SharedCategoryMapping> {
    const { userId, partnershipId, userCategoryId, sharedCategoryId } = input
    // TODO: partnership will be validated from middleware
    this.categoryService.findById({
      id: userCategoryId,
      userId,
    })

    const sharedCategory = this.partnershipRepository.findSharedCategory({
      partnershipId,
      sharedCategoryId,
    })

    if (!sharedCategory) throw new SharedCategoryNotFoundError()

    const mappedCategory = await this.partnershipRepository.createSharedCategoryMapping({
      userId,
      userCategoryId,
      sharedCategoryId,
    })

    return mappedCategory
  }

  private async hasActivePartnership(userId: string): Promise<boolean> {
    return (await this.partnershipRepository.findUserActivePartnership(userId)) !== null
  }

  private toCanonicalUserPair(userId1: string, userId2: string) {
    return userId1 < userId2
      ? { userAId: userId1, userBId: userId2 }
      : { userAId: userId2, userBId: userId1 }
  }
  // TODO: get partner ID from middleware
  // private partnerOf(p: Partnership, userId: string): string {
  //   if (p.userAId === userId) return p.userBId
  //   if (p.userBId === userId) return p.userAId
  //   throw new Error('Not a member')
  // }

  private async createDefaultSharedCategories(partnershipId: string, client: DatabaseClient) {
    const defaults = SHARED_CATEGORY_DEFAULTS.map((cat) => ({
      partnershipId,
      name: cat.name,
    }))

    await this.partnershipRepository.createSharedCategories(defaults, client)
  }
}
