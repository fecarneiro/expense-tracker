import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot } from 'grammy'
import type { Container } from '../../container.js'
import { handlePartnershipInvite } from '../partners/partnerships/bot/invite.handler.js'
import { handlePartnershipJoin } from '../partners/partnerships/bot/join.handler.js'
import { handlePartnershipBalance } from '../partners/settlements/bot/balance.handler.js'
import { handleSettleConversation } from '../partners/settlements/bot/settle.handler.js'
import { handleMapCategoryConversation } from '../partners/shared-categories/bot/map-category.handler.js'
import { handleNewSharedExpenseConversation } from '../partners/shared-expenses/bot/new-shared-expense.handler.js'
import { handleFastTransaction } from '../transactions/bot/fast-transaction.handler.js'
import { handleLastTransactions } from '../transactions/bot/last-transactions.handler.js'
import { handleNewTransactionConversation } from '../transactions/bot/new-transaction.handler.js'
import { handleMonthlyReport } from '../transactions/bot/report.handler.js'
import type { BotContext } from './bot.context.js'
import { registerBotCommands } from './commands.js'
import type { BotRuntimeConfig } from './config/bot.config.js'
import { errorHandler } from './error-handler.js'
import { handleCancel } from './handlers/cancel.handler.js'
import { handleLinkAccount } from './handlers/link-account.handler.js'
import { handleStart } from './handlers/start.handler.js'
import { botLoggerMiddleware } from './middlewares/bot-logger.middleware.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import { userPartnershipMiddleware } from './middlewares/user-partnership.middleware.js'
import { botLinkRateLimiter } from './rate-limit/bot.rate-limiter.js'

export function createBot(container: Container, config: Pick<BotRuntimeConfig, 'botToken'>) {
  const {
    botService,
    categoryService,
    transactionService,
    partnershipService,
    sharedCategoryService,
    sharedExpenseService,
    settlementService,
  } = container

  const bot = new Bot<BotContext>(config.botToken)

  bot.catch(errorHandler)
  bot.use(botLoggerMiddleware)

  // ── Public Commands ───────────────────────────────────
  bot.command('start', (ctx) => handleStart(ctx))
  bot.command('link', botLinkRateLimiter, (ctx) => handleLinkAccount(ctx, botService))

  // ── Authenticated Commands ─────────────────────────────
  bot.use(userIdentityMiddleware(botService))
  bot.use(userPartnershipMiddleware(partnershipService))

  // Conversations
  bot.use(conversations())

  bot.command('cancel', async (ctx) => {
    await handleCancel(ctx)
  })
  bot.use(
    createConversation(
      handleNewTransactionConversation(categoryService, transactionService),
      'newTransaction',
    ),
  )
  bot.use(
    createConversation(
      handleNewSharedExpenseConversation(sharedCategoryService, sharedExpenseService),
      'newSharedExpense',
    ),
  )
  bot.use(createConversation(handleSettleConversation(settlementService), 'settlePartnership'))
  bot.use(
    createConversation(
      handleMapCategoryConversation(sharedCategoryService, categoryService),
      'mapSharedCategory',
    ),
  )

  // Commands
  bot.command('expense', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'expense')
  })

  bot.command('income', async (ctx) => {
    await ctx.conversation.enter('newTransaction', 'income')
  })

  bot.command('shared', async (ctx) => {
    await ctx.conversation.enter('newSharedExpense')
  })

  bot.command('balance', async (ctx) => {
    await handlePartnershipBalance(ctx, settlementService)
  })

  bot.command('settle', async (ctx) => {
    await ctx.conversation.enter('settlePartnership')
  })

  bot.command('invite_partner', async (ctx) => {
    await handlePartnershipInvite(ctx, partnershipService)
  })

  bot.command('join_partner', async (ctx) => {
    await handlePartnershipJoin(ctx, partnershipService)
  })

  bot.command('map_category', async (ctx) => {
    await ctx.conversation.enter('mapSharedCategory')
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
