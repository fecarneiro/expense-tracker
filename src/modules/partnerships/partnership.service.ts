import type { Database, DatabaseClient } from '../../database/db.js'
import type { LinkingCodeService } from '../linking-codes/linking-code.service.js'
import { SHARED_CATEGORY_DEFAULTS } from './partnership.defaults.js'
import {
  CannotPartnerWithYourselfError,
  InviteeAlreadyHasActivePartnership,
  InviterAlreadyHasActivePartnership,
} from './partnership.errors.js'
import type { PartnershipRepository } from './partnership.repository.js'
import type { Partnership } from './partnership.types.js'

export type CreatePartnership = {
  inviteeId: string
  code: number
}
export type CreateSharedCategory = {
  partnershipId: string
  name: string
}

export class PartnershipService {
  constructor(
    private readonly linkingCodeService: LinkingCodeService,
    private readonly partnershipRepository: PartnershipRepository,
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

  private async hasActivePartnership(userId: string): Promise<boolean> {
    return (await this.partnershipRepository.findUserActivePartnership(userId)) !== null
  }

  private toCanonicalUserPair(userId1: string, userId2: string) {
    return userId1 < userId2
      ? { userAId: userId1, userBId: userId2 }
      : { userAId: userId2, userBId: userId1 }
  }

  private partnerOf(p: Partnership, userId: string): string {
    if (p.userAId === userId) return p.userBId
    if (p.userBId === userId) return p.userAId
    throw new Error('not a member')
  }

  private async createDefaultSharedCategories(partnershipId: string, client: DatabaseClient) {
    const defaults = SHARED_CATEGORY_DEFAULTS.map((cat) => ({
      partnershipId,
      name: cat.name,
    }))

    await this.partnershipRepository.createSharedCategories(defaults, client)
  }
}
