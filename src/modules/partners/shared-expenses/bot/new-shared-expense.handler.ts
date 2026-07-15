import { InlineKeyboard } from 'grammy'
import type { BotConversation, BotConversationContext } from '../../../bot/bot.context.js'
import { transactionAmountParser } from '../../../transactions/bot/parsers/transaction-amount.parser.js'
import type { TransactionService } from '../../../transactions/transaction.service.js'
import type { TransactionType } from '../../../transactions/transaction.types.js'
import type { SharedCategoryService } from '../../shared-categories/shared-category.service.js'
import type { CreateSharedExpense } from '../shared-expense.service.js'
import type { SplitType } from '../shared-expense.types.js'
import { sharedExpenseAmountParser } from './parsers/shared-expense-amount.parser.js'

export type NewSharedExpenseConversation = CreateSharedExpense & {
  partnershipId: string
  partnerId: string
  sharedCategoryName: string
}

export function handleNewSharedTransactionConversation(
  sharedCategoryService: SharedCategoryService,
  transactionService: TransactionService,
) {
  return async function handleNewSharedTransaction(
    conversation: BotConversation,
    ctx: BotConversationContext,
    transactionType: TransactionType,
  ) {
    const partnership = await conversation.external((ctx) => ctx.partnership)
    // TODO: Review this message.
    if (!partnership) return ctx.reply('You are not part of a partnership yet.')

    const { id: partnershipId, partnerId } = partnership

    const sharedCategories = await conversation.external(() =>
      sharedCategoryService.findPartnershipSharedCategories(partnershipId),
    )

    if (sharedCategories.length === 0) {
      return ctx.reply(`Create at least one shared category before adding a partner's expense.`)
    }

    // ── Amount Input ─────────────────────────────
    let amountCents: number | null = null
    const split: SplitType | null = null

    await ctx.reply(`How much did you spend?`)

    do {
      const { message } = await conversation.waitFor('message:text')
      amountCents = sharedExpenseAmountParser(message.text)

      if (amountCents == null) await ctx.reply('Invalid amount. Send a positive number, e.g. 12.50')
    } while (amountCents == null)

    // ── Category Keyboard ─────────────────────────────

    const kb = new InlineKeyboard()
    for (const c of sharedCategories) kb.text(c.name, `cat:${c.id}`).row()
    await ctx.reply("Choose a partnership's shared category:", { reply_markup: kb })

    const sharedCategoryId: string | null = null
    const sharedCategoryName: string | null = null

    do {
      const choice = await conversation.waitForCallbackQuery(/^cat:(.+)$/)
      const sharedCategory = sharedCategories.find((c) => c.id === choice.match[1])

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
      amountCents,
      categoryId,
      occurredAt: new Date(),
      description: null,
    })

    // ── Reply ─────────────────────────────────────
    const amount = centsToString(amountCents)

    return ctx.reply(`${label} added ✅\n\n` + `Amount: $${amount}\n` + `Category: ${categoryName}`)
  }
}
