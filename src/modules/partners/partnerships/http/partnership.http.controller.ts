import type { Request, Response } from 'express'
import { createPartnershipBodySchema } from '../partnership.schemas.js'
import type { PartnershipService } from '../partnership.service.js'

export class PartnershipHttpController {
  constructor(private readonly partnershipService: PartnershipService) {}

  async createLinkingCode(req: Request, res: Response) {
    const linkingCode = await this.partnershipService.createLinkingCode(req.auth.userId)
    res.status(201).json(linkingCode)
  }

  async create(req: Request, res: Response) {
    const { code } = createPartnershipBodySchema.parse(req.body)
    const partnership = await this.partnershipService.createPartnership({
      inviteeId: req.auth.userId,
      code,
    })
    // TODO: remove users ID from response
    res.status(201).json(partnership)
  }
}
