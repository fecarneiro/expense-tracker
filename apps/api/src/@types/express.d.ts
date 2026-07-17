import type { PartnershipContext } from '../modules/partners/partnerships/partnership.service.js'

declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string
      }
      partnership?: PartnershipContext | null
    }
  }
}
