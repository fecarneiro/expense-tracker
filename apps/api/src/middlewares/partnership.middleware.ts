import type { NextFunction, Request, Response } from 'express'
import type { PartnershipService } from '../modules/partners/partnerships/partnership.service.js'

export function partnershipMiddleware(partnershipService: PartnershipService) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    req.partnership = await partnershipService.findPartnershipContext(req.auth.userId)
    next()
  }
}
