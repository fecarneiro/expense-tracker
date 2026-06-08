import { Bot } from 'grammy'
import { env } from '../../config/env.config.js'
import type { Container } from '../../container.js'
import { transactionHandler } from './handlers/transaction.handler.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import { registerBotCommands } from './parsers/commands.js'
import type { BotContext } from './telegram.context.js'
import { errorHandler } from './telegram.error-handler.js'

export function createTelegramBot(container: Container) {
  const { telegramService, categoryService, transactionService } = container

  const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN)

  bot.catch(errorHandler)

  //--- Public Commands
  bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
  bot.command('me', (ctx) => {
    if (!ctx.from) return ctx.reply('Error getting Telegram ID')
    return ctx.reply(ctx.from.id.toString())
  })
  bot.command('hi', (ctx) => console.log(JSON.stringify(ctx, null, 2)))

  //--- Gate: everything below requires a linked account
  bot.use(userIdentityMiddleware(telegramService))

  // --- Handlers
  bot.use(transactionHandler(transactionService, categoryService))

  // --- Commands
  registerBotCommands(bot)

  bot.start()
}
