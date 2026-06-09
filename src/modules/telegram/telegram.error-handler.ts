import { type BotError, GrammyError, HttpError } from 'grammy'
import { ZodError } from 'zod'
import { AppError } from '../../shared/app-error.js'

export async function errorHandler(err: BotError): Promise<void> {
  const { ctx, error } = err
  console.error(`Error while handling update ${ctx.update.update_id}:`, error)

  // Telegram channel is down/rejected the request — can't reply
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
    console.log('Failed to send the error reply', replyError)
  }
}
