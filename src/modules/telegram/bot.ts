import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot } from 'grammy'
import { env } from '../../config/env.config.js'
import type { Container } from '../../container.js'
import { registerBotCommands } from './commands.js'
import { handleMonthlyBalance } from './handlers/balance.handler.js'
import { handleNewTransactionConversation } from './handlers/transaction.handler.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import type { BotContext } from './telegram.context.js'
import { errorHandler } from './telegram.error-handler.js'

export function createTelegramBot(container: Container) {
  const { telegramService, categoryService, transactionService, analyticsService } = container

  const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN)

  bot.catch(errorHandler)

  // ── Public Commands ───────────────────────────────────
  bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
  bot.command('me', (ctx) => {
    if (!ctx.from) return ctx.reply('Error getting Telegram ID')
    return ctx.reply(ctx.from.id.toString())
  })

  // ── Authenticated Commands ─────────────────────────────
  // User Identity Middleware
  bot.use(userIdentityMiddleware(telegramService))

  // Conversations
  bot.use(conversations())
  bot.use(
    createConversation(
      handleNewTransactionConversation(categoryService, transactionService),
      'newTransaction',
    ),
  )

  // Commands
  bot.command('expense', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'expense')
  })

  bot.command('income', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'income')
  })

  bot.command('report', async (ctx) => {
    await handleMonthlyBalance(ctx, analyticsService)
  })

  // ── Bot Commands Menu ─────────────────────────────────
  registerBotCommands(bot)

  return bot
}
