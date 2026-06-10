import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot } from 'grammy'
import { env } from '../../config/env.config.js'
import type { Container } from '../../container.js'
import { registerBotCommands } from './commands.js'
import { handleNewTransactionConversation } from './handlers/transaction.handler.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import type { BotContext } from './telegram.context.js'
import { errorHandler } from './telegram.error-handler.js'

export function createTelegramBot(container: Container) {
  const { telegramService, categoryService, transactionService } = container

  const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN)

  bot.catch(errorHandler)

  // Public Commands
  bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
  bot.command('me', (ctx) => {
    if (!ctx.from) return ctx.reply('Error getting Telegram ID')
    return ctx.reply(ctx.from.id.toString())
  })

  // Gate: everything below requires a linked account
  bot.use(userIdentityMiddleware(telegramService))

  // Handlers

  bot.use(conversations())
  bot.use(
    createConversation(
      handleNewTransactionConversation(categoryService, transactionService),
      'newTransaction',
    ),
  )

  bot.command('expense', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'expense')
  })

  bot.command('income', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'income')
  })

  // Commands
  registerBotCommands(bot)

  bot.start()
}
