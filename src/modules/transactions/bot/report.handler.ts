import { monthToReadable } from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import type { BotContext } from '../../bot/bot.context.js'
import type { TransactionService } from '../transaction.service.js'

export async function handleMonthlyReport(ctx: BotContext, transactionService: TransactionService) {
  const { userId } = ctx
  const results = await transactionService.findMonthlyTotalsInRange({ userId })

  if (results.length === 0) return ctx.reply('No transactions yet for this period 📭')

  const message = results
    .map(
      (result) =>
        `📊 <b>${monthToReadable(result.month)}</b>\n` +
        `+ Incomes: <b>$${centsToString(result.incomeTotal)}</b>\n` +
        `- Expenses: <b>$${centsToString(result.expenseTotal)}</b>\n` +
        `💰 Balance: <b>$${centsToString(result.balance)}</b>`,
    )
    .join('\n\n')

  return ctx.reply(message, { parse_mode: 'HTML' })
}
