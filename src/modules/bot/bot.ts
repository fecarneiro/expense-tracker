import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot } from 'grammy'
import type { Container } from '../../container.js'
import { handleFastTransaction } from '../transactions/bot/fast-transaction.handler.js'
import { handleLastTransactions } from '../transactions/bot/last-transactions.handler.js'
import { handleNewTransactionConversation } from '../transactions/bot/new-transaction.handler.js'
import { handleMonthlyReport } from '../transactions/bot/report.handler.js'
import type { BotContext } from './bot.context.js'
import { registerBotCommands } from './commands.js'
import type { BotRuntimeConfig } from './config/bot.config.js'
import { errorHandler } from './error-handler.js'
import { handleLinkAccount } from './handlers/link-account.handler.js'
import { handleStart } from './handlers/start.handler.js'
import { botLoggerMiddleware } from './middlewares/bot-logger.middleware.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import { botLinkRateLimiter } from './rate-limit/bot.rate-limiter.js'

export function createBot(container: Container, config: Pick<BotRuntimeConfig, 'botToken'>) {
  const { botService, categoryService, transactionService } = container

  const bot = new Bot<BotContext>(config.botToken)

  bot.catch(errorHandler)
  bot.use(botLoggerMiddleware)

  // ── Public Commands ───────────────────────────────────
  bot.command('start', (ctx) => handleStart(ctx))
  bot.command('link', botLinkRateLimiter, (ctx) => handleLinkAccount(ctx, botService))

  // ── Authenticated Commands ─────────────────────────────
  // Middleware
  bot.use(userIdentityMiddleware(botService))

  // Conversations
  bot.use(conversations())
  bot.use(
    createConversation(
      handleNewTransactionConversation(categoryService, transactionService),
      'newTransaction',
    ),
  )

  // TODO: partnership middleware

  // Commands
  bot.command('expense', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'expense')
  })

  bot.command('income', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'income')
  })

  bot.command('report', async (ctx) => {
    await handleMonthlyReport(ctx, transactionService)
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
