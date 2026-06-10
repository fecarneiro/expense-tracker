import { InlineKeyboard } from 'grammy'
import { unixToDateString } from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import type { CategoryService } from '../../categories/category.service.js'
import type {
  TransactionAmountInCents,
  TransactionType,
} from '../../transactions/transaction.dto.js'
import type { TransactionService } from '../../transactions/transaction.service.js'
import { newTransactionParser } from '../parsers/new-transaction.parser.js'
import type { BotConversation, BotConversationContext } from '../telegram.context.js'

export function handleNewTransactionConversation(
  categoryService: CategoryService,
  transactionService: TransactionService,
) {
  return async function handleNewTransaction(
    conversation: BotConversation,
    ctx: BotConversationContext,
    transactionType: TransactionType,
  ) {
    const userId = await conversation.external((ctx) => ctx.userId)

    // ── Amount Input ─────────────────────────────
    await ctx.reply('How much did you spend?')
    let amountInCents: TransactionAmountInCents | null = null
    let occurredAt = null

    do {
      const { message } = await conversation.waitFor('message:text')
      amountInCents = newTransactionParser(message.text)
      occurredAt = message.date

      if (amountInCents == null)
        await ctx.reply('Invalid amount. Send a positive number, e.g. 12.50')
    } while (amountInCents == null)

    // ── Category Keyboard ─────────────────────────────
    const categories = await conversation.external(() => categoryService.findAll({ userId }))

    const kb = new InlineKeyboard()
    for (const c of categories) kb.text(c.name, `cat:${c.id}`).row()
    await ctx.reply('Choose a category:', { reply_markup: kb })

    let categoryId: string | null = null
    let categoryName = ''

    do {
      const choice = await conversation.waitForCallbackQuery(/^cat:(.+)$/)
      const category = categories.find((c) => c.id === choice.match[1])

      if (!category) {
        await choice.answerCallbackQuery({ text: 'Invalid category' })
        continue
      }

      categoryId = category.id
      categoryName = category.name
      await choice.answerCallbackQuery()
      await choice.editMessageText(`⏳ Saving your transaction...`)
    } while (categoryId === null)

    // ── Date Resolution ─────────────────────────────
    const occurredOn = unixToDateString(occurredAt)
    console.log(occurredOn)

    await transactionService.create({
      userId,
      amountInCents,
      categoryId,
      occurredOn,
      transactionType,
      notes: null,
    })

    const label = transactionType === 'expense' ? 'Expense' : 'Income'
    const amount = centsToString(amountInCents)

    // ── Reply ─────────────────────────────────────
    return ctx.reply(`${label} added ✅\n\n` + `Amount: $${amount}\n` + `Category: ${categoryName}`)

    // TODO: overview + whatNextMenu
  }
}
