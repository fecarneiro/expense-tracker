import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot, InlineKeyboard } from 'grammy'
import { env } from '../../config/env.config.js'
import type { Container } from '../../container.js'
import type { TransactionAmountInCents, TransactionType } from '../transactions/transaction.dto.js'
import { registerBotCommands } from './commands.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import { newTransactionParser } from './parsers/new-transaction.parser.js'
import type { BotContext, BotConversation, BotConversationContext } from './telegram.context.js'
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

  async function handleNewTransaction(
    conversation: BotConversation,
    ctx: BotConversationContext,
    transactionType: TransactionType,
  ) {
    const userId = await conversation.external((ctx) => ctx.userId)

    // 1) Amount input
    await ctx.reply('How much did you spend?')
    let amountInCents: TransactionAmountInCents | null = null

    do {
      const { message } = await conversation.waitFor('message:text')
      amountInCents = newTransactionParser(message.text)

      if (amountInCents == null)
        await ctx.reply('Invalid amount. Send a positive number, e.g. 12.50')
    } while (amountInCents == null)

    // Category
    const categories = await conversation.external(() => categoryService.findAll({ userId }))

    const kb = new InlineKeyboard()
    for (const c of categories) kb.text(c.name, `cat:${c.id}`).row()
    await ctx.reply('Choose a category:', { reply_markup: kb })

    let categoryId: string | null = null
    do {
      const choice = await conversation.waitForCallbackQuery(/^cat:(.+)$/)
      const category = categories.find((c) => c.id === choice.match[1])

      if (!category) {
        await choice.answerCallbackQuery({ text: 'Invalid category' })
        continue
      }

      categoryId = category.id
      await choice.answerCallbackQuery()
      await choice.editMessageText(`⏳ Saving your transaction...`)
    } while (categoryId === null)

    // Date
    const occurredOn = await conversation.external(() => new Date().toISOString().slice(0, 10))

    await transactionService.create({
      userId,
      amountInCents,
      categoryId,
      occurredOn,
      transactionType,
      notes: null,
    })

    return ctx.reply('Transaction saved ✅')
    // TODO: overview + whatNextMenu
  }

  bot.use(conversations())
  bot.use(createConversation(handleNewTransaction))

  bot.command('expense', async (ctx) => {
    await ctx.conversation.enter('handleNewTransaction', 'expense')
  })

  bot.command('income', async (ctx) => {
    await ctx.conversation.enter('handleNewTransaction', 'income')
  })

  // Commands
  registerBotCommands(bot)

  bot.start()
}
