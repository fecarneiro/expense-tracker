import type { NextFunction } from 'grammy'
import type { BotContext } from '../bot.context.js'
import type { BotService } from '../bot.service.js'

export function userIdentityMiddleware(botService: BotService) {
  return async (ctx: BotContext, next: NextFunction) => {
    const telegramId = ctx.from?.id

    if (!telegramId) return

    const account = await botService.findAccountByTelegramId(telegramId)

    if (!account) {
      await ctx.reply(
        "You haven't linked your account yet. Generate a linking code in the app, then use /link with your 6-digit code.",
      )
      return
    }

    ctx.userId = account.userId
    await next()
  }
}
