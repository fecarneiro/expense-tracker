import { limit } from '@grammyjs/ratelimiter'
import type { BotContext } from '../bot.context.js'

const BOT_LINK_RATE_LIMIT = {
  TIME_FRAME: 15 * 60 * 1000,
  LIMIT: 5,
}

export const botLinkRateLimiter = limit({
  timeFrame: BOT_LINK_RATE_LIMIT.TIME_FRAME,
  limit: BOT_LINK_RATE_LIMIT.LIMIT,

  storageClient: 'MEMORY_STORE',

  onLimitExceeded: async (ctx: BotContext) => {
    await ctx.reply('You have reached the maximum number of attempts. Please try again later.')
  },

  keyGenerator: (ctx: BotContext) => {
    return ctx.from?.id.toString()
  },
})
