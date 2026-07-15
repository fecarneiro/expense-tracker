import type { Database } from '../../../database/db.js'
import type { LinkingCodeService } from '../../linking-codes/linking-code.service.js'
import type { SharedCategoryService } from '../shared-categories/shared-category.service.js'
import {
  CannotPartnerWithYourselfError,
  InviteeAlreadyHasActivePartnership,
  InviterAlreadyHasActivePartnership,
} from './partnership.errors.js'
import type { PartnershipRepository } from './partnership.repository.js'
import type { Partnership } from './partnership.types.js'
import { toCanonicalUserPair } from './partnership.utils.js'

export type CreatePartnership = {
  inviteeId: string
  code: number
}

export class PartnershipService {
  constructor(
    private readonly linkingCodeService: LinkingCodeService,
    private readonly partnershipRepository: PartnershipRepository,
    private readonly sharedCategoryService: SharedCategoryService,
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

  private async hasActivePartnership(userId: string): Promise<boolean> {
    return (await this.partnershipRepository.findUserActivePartnership(userId)) !== null
  }
}
