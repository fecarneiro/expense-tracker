import { type BotError, GrammyError, HttpError } from 'grammy'
import { ZodError } from 'zod'
import { AppError } from '../../shared/app-error.js'
import { logger } from '../../shared/logger/logger.js'
import type { BotContext } from './bot.context.js'

export async function errorHandler(err: BotError<BotContext>): Promise<void> {
  const { ctx, error } = err

  // Bot platform API/network errors are already logged by the middleware and may not be reported to the user.
  if (error instanceof GrammyError || error instanceof HttpError) return

  let replyMessage: string

  if (error instanceof AppError) {
    replyMessage = error.message
  } else if (error instanceof ZodError) {
    replyMessage = 'Invalid format input'
  } else {
    replyMessage = 'Oops, something went wrong. Please try again later.'
  }

  try {
    await ctx.reply(replyMessage)
  } catch (replyError) {
    ctx.logger
      ? ctx.logger.error({ err: replyError }, 'bot.error.reply_failed')
      : logger.error({ err: replyError }, 'bot.error.reply_failed')
  }
}
