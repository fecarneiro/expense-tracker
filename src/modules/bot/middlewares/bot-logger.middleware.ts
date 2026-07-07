import type { NextFunction } from 'grammy'
import { logger, verbose } from '../../../shared/logger/logger.js'
import type { BotContext } from '../bot.context.js'

export async function botLoggerMiddleware(ctx: BotContext, next: NextFunction) {
  const startedAt = Date.now()

  ctx.logger = logger.child({
    source: 'bot',
    updateId: ctx.update.update_id,
    chatType: ctx.chat?.type,
    updateType: ctx.message ? 'message' : ctx.callbackQuery ? 'callback_query' : 'unknown',
  })

  if (verbose) {
    ctx.logger.debug(
      {
        update: ctx.update,
      },
      'bot.update.received',
    )
  }

  try {
    await next()

    ctx.logger.info(
      {
        durationMs: Date.now() - startedAt,
        userId: ctx.userId ?? null,
      },
      'bot.update.handled',
    )
  } catch (error) {
    ctx.logger.error(
      {
        err: error,
        durationMs: Date.now() - startedAt,
        userId: ctx.userId ?? null,
      },
      'bot.update.failed',
    )

    throw error
  }
}
