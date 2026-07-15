import type { Database } from '../../../database/db.js'
import { LINKING_CODE_PURPOSE } from '../../linking-codes/linking-code.constants.js'
import type { LinkingCodeService } from '../../linking-codes/linking-code.service.js'
import type { GeneratedLinkingCode } from '../../linking-codes/linking-code.types.js'
import type { SharedCategoryService } from '../shared-categories/shared-category.service.js'
import {
  CannotPartnerWithYourselfError,
  InviteeAlreadyHasActivePartnership,
  InviterAlreadyHasActivePartnership,
} from './partnership.errors.js'
import type { PartnershipRepository } from './partnership.repository.js'
import type { Partnership } from './partnership.types.js'
import { partnerOf, toCanonicalUserPair } from './partnership.utils.js'

export type CreatePartnership = {
  inviteeId: string
  code: number
}

export type PartnershipContext = {
  id: string
  partnerId: string
}

export class PartnershipService {
  constructor(
    private readonly linkingCodeService: LinkingCodeService,
    private readonly partnershipRepository: PartnershipRepository,
    private readonly sharedCategoryService: SharedCategoryService,
    private readonly db: Database,
  ) {}

  async createLinkingCode(userId: string): Promise<GeneratedLinkingCode> {
    if (await this.hasActivePartnership(userId)) {
      throw new InviterAlreadyHasActivePartnership()
    }

    return this.linkingCodeService.create({
      userId,
      purpose: LINKING_CODE_PURPOSE.PARTNERSHIP_LINK,
    })
  }

  async createPartnership(data: CreatePartnership): Promise<Partnership> {
    const { inviteeId, code } = data

    const { userId: inviterId } = await this.linkingCodeService.verify({
      code,
      purpose: LINKING_CODE_PURPOSE.PARTNERSHIP_LINK,
    })

    if (inviterId === inviteeId) {
      throw new CannotPartnerWithYourselfError()
    }
    // TODO: remove this after middleware implementation
    if (await this.hasActivePartnership(inviteeId)) {
      throw new InviteeAlreadyHasActivePartnership()
    }

    if (await this.hasActivePartnership(inviterId)) {
      throw new InviterAlreadyHasActivePartnership()
    }

    const { userAId, userBId } = toCanonicalUserPair(inviterId, inviteeId)

    return await this.db.transaction(async (tx) => {
      const partnership = await this.partnershipRepository.createPartnership(
        { userAId, userBId },
        tx,
      )
      await this.sharedCategoryService.createDefaults(partnership.id, tx)

      return partnership
    })
  }

  // Middleware usage
  async findPartnershipContext(userId: string): Promise<PartnershipContext | null> {
    const partnership = await this.partnershipRepository.findUserActivePartnership(userId)
    if (!partnership) return null

    return {
      id: partnership.id,
      partnerId: partnerOf(partnership, userId),
    }
  }

  // TODO: remove this after middleware implementation
  private async hasActivePartnership(userId: string): Promise<boolean> {
    return (await this.partnershipRepository.findUserActivePartnership(userId)) !== null
  }
}
