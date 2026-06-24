import type { Filter } from 'grammy'
import { unixToDateString } from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import type { CategoryService } from '../../categories/category.service.js'
import type { TransactionService } from '../../transactions/transaction.service.js'
import { fastTransactionParser } from '../parsers/fast-transaction.parser.js'
import type { BotContext } from '../telegram.context.js'

export async function handleFastTransaction(
  ctx: Filter<BotContext, 'message:text'>,
  categoryService: CategoryService,
  transactionService: TransactionService,
) {
  const { userId } = ctx
  const message = ctx.msg.text
  const occurredAt = ctx.msg.date

  const parsed = fastTransactionParser(message)

  if (!parsed) {
    await ctx.reply(
      `Your message is not a valid input.\n\n` +
        `If you meant to record a transaction, send it like this:\n\n` +
        `<b>Expense:</b>\n<pre>200 eating out\n` +
        `-40.10 groceries</pre>\n\n` +
        `<b>Income:</b>\n<pre>+300.90 salary</pre>`,
      { parse_mode: 'HTML' },
    )
    return
  }

  const { transactionType, amountInCents, categoryName } = parsed

  const category = await categoryService.findByNameAndType({
    userId,
    name: parsed.categoryName,
    categoryType: parsed.transactionType,
  })

  if (!category) {
    return await ctx.reply(
      `No ${transactionType} category named "${categoryName}".\n\n` +
        `Create it in the app first, or use /${transactionType} to pick from existing categories.`,
    )
  }

  await transactionService.create({
    userId,
    amountInCents: parsed.amountInCents,
    categoryId: category.id,
    occurredOn: unixToDateString(occurredAt),
    transactionType,
  })

  // ── Reply ─────────────────────────────────────
  const label = transactionType === 'expense' ? 'Expense' : 'Income'
  const amount = centsToString(amountInCents)

  return ctx.reply(`${label} added ✅\n\n` + `Amount: $${amount}\n` + `Category: ${categoryName}`)
}
