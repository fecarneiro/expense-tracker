import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot } from 'grammy'
import type { Container } from '../../container.js'
import { registerBotCommands } from './commands.js'
import type { TelegramRuntimeConfig } from './config/telegram.config.js'
import { errorHandler } from './error-handler.js'
import { handleMonthlyBalance } from './handlers/balance.handler.js'
import { handleFastTransaction } from './handlers/fast-transaction.handler.js'
import { handleLastTransactions } from './handlers/last-transactions.handler.js'
import { handleLinkAccount } from './handlers/link-account.handler.js'
import { handleNewTransactionConversation } from './handlers/new-transaction.handler.js'
import { handleStart } from './handlers/start.handler.js'
import { telegramLoggerMiddleware } from './middlewares/telegram-logger.middleware.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import type { BotContext } from './telegram.context.js'

export function createTelegramBot(
  container: Container,
  config: Pick<TelegramRuntimeConfig, 'botToken'>,
) {
  const { telegramService, categoryService, transactionService, analyticsService } = container

  const bot = new Bot<BotContext>(config.botToken)

  bot.catch(errorHandler)
  bot.use(telegramLoggerMiddleware)

  // ── Public Commands ───────────────────────────────────
  bot.command('start', (ctx) => handleStart(ctx))
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

  // Text Messages
  bot.on('message:text', async (ctx) => {
    await handleFastTransaction(ctx, categoryService, transactionService)
  })

  // ── Bot Commands Menu ─────────────────────────────────
  registerBotCommands(bot)

  return bot
}
