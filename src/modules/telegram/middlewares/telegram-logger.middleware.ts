import type { NextFunction } from 'grammy'
import { logger } from '../../../shared/logger/logger.js'
import type { BotContext } from '../telegram.context.js'

export async function telegramLoggerMiddleware(ctx: BotContext, next: NextFunction) {
  const startedAt = Date.now()

  ctx.logger = logger.child({
    source: 'telegram',
    updateId: ctx.update.update_id,
  })

  try {
    await next()

    ctx.logger.info(
      {
        durationMs: Date.now() - startedAt,
        userId: ctx.userId ?? null,
      },
      'telegram.update.handled',
    )
  } catch (error) {
    ctx.logger.error(
      {
        err: error,
        durationMs: Date.now() - startedAt,
        userId: ctx.userId ?? null,
      },
      'telegram.update.failed',
    )

    throw error
  }
}
