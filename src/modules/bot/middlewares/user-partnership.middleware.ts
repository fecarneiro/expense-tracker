import type { NextFunction } from 'grammy'
import type { PartnershipService } from '../../partners/partnerships/partnership.service.js'
import type { BotContext } from '../bot.context.js'

export function userPartnershipMiddleware(partnershipService: PartnershipService) {
  return async (ctx: BotContext, next: NextFunction) => {
    ctx.partnership = await partnershipService.findPartnershipContext(ctx.userId)
    await next()
  }
}
