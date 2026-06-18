import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot } from 'grammy'
import type { Container } from '../../container.js'
import { registerBotCommands } from './commands.js'
import type { TelegramRuntimeConfig } from './config/telegram.config.js'
import { errorHandler } from './error-handler.js'
import { handleMonthlyBalance } from './handlers/balance.handler.js'
import { handleLastTransactions } from './handlers/last-transactions.handler.js'
import { handleLinkAccount } from './handlers/link-account.handler.js'
import { handleNewTransactionConversation } from './handlers/transaction.handler.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import type { BotContext } from './telegram.context.js'

export function createTelegramBot(
  container: Container,
  config: Pick<TelegramRuntimeConfig, 'botToken'>,
) {
  const { telegramService, categoryService, transactionService, analyticsService } = container

  const bot = new Bot<BotContext>(config.botToken)

  bot.catch(errorHandler)

  // ── Public Commands ───────────────────────────────────
  bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
  bot.command('link', (ctx) => handleLinkAccount(ctx, telegramService))

  // ── Authenticated Commands ─────────────────────────────
  // Middleware
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

  bot.command('last', async (ctx) => {
    await handleLastTransactions(ctx, transactionService)
  })

  // ── Bot Commands Menu ─────────────────────────────────
  registerBotCommands(bot)

  return bot
}
