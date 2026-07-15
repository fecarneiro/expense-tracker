import type { NextFunction } from 'grammy'
import type { PartnershipService } from '../../partners/partnerships/partnership.service.js'
import type { BotContext } from '../bot.context.js'
import type { BotService } from '../bot.service.js'

export function userPartnershipMiddleware(
  partnershipService: PartnershipService,
  botService: BotService,
) {
  return async (ctx: BotContext, next: NextFunction) => {
    const partnership = await partnershipService.findPartnershipContext(ctx.userId)

    if (!partnership) {
      ctx.partnership = null
      return next()
    }

    ctx.partnership = {
      ...partnership,
      partnerTelegramId: await botService.findTelegramIdByUserId(partnership.partnerId),
    }

    await next()
  }
}
