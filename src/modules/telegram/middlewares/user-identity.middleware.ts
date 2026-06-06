import type { NextFunction } from 'grammy'
import type { BotContext } from '../bot.js'

import type { TelegramService } from '../telegram.service.js'

export function userIdentityMiddleware(telegramService: TelegramService) {
  return async (ctx: BotContext, next: NextFunction) => {
    const telegramId = ctx.from?.id

    if (!telegramId) return

    const account = await telegramService.getUserIdByTelegramId({ telegramId })
    if (!account) {
      await ctx.reply("You haven't linked your account yet. Use /me and link through the app.")
      return
    }

    ctx.userId = account.userId
    await next()
  }
}
