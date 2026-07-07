import { InlineKeyboard } from 'grammy'
import { centsToString } from '../../../utils/money.utils.js'
import type { CategoryService } from '../../categories/category.service.js'
import type { TransactionService } from '../../transactions/transaction.service.js'
import type {
  TransactionAmountInCents,
  TransactionType,
} from '../../transactions/transaction.types.js'
import { transactionAmountParser } from '../parsers/transaction-amount.parser.js'
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

    const categories = await conversation.external(() =>
      categoryService.findByType({
        userId,
        categoryType: transactionType,
      }),
    )

    if (categories.length === 0) {
      return ctx.reply(
        `Create at least one category of type '${transactionType}' before adding a transaction.`,
      )
    }

    // ── Amount Input ─────────────────────────────
    const transactionLabel = transactionType === 'expense' ? 'spent' : 'received'

    await ctx.reply(`How much did you ${transactionLabel}?`)
    let amountInCents: TransactionAmountInCents | null = null

    do {
      const { message } = await conversation.waitFor('message:text')
      amountInCents = transactionAmountParser(message.text)

      if (amountInCents == null)
        await ctx.reply('Invalid amount. Send a positive number, e.g. 12.50')
    } while (amountInCents == null)

    // ── Category Keyboard ─────────────────────────────

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
    await transactionService.create({
      userId,
      amountInCents,
      categoryId,
      occurredAt: new Date(),
      notes: null,
    })

    // ── Reply ─────────────────────────────────────
    const label = transactionType === 'expense' ? 'Expense' : 'Income'
    const amount = centsToString(amountInCents)

    return ctx.reply(`${label} added ✅\n\n` + `Amount: $${amount}\n` + `Category: ${categoryName}`)
  }
}
