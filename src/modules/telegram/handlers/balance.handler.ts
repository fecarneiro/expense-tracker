import {
  currentUtcMonth,
  monthToReadable,
  monthToStartDate,
  nextMonth,
} from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import type { TransactionService } from '../../transactions/transaction.service.js'

import type { BotContext } from '../telegram.context.js'

export async function handleMonthlyBalance(
  ctx: BotContext,
  transactionService: TransactionService,
) {
  const { userId } = ctx
  const month = currentUtcMonth()
  const from = new Date(`${monthToStartDate(month)}T00:00:00Z`)
  const until = new Date(`${monthToStartDate(nextMonth(month))}T00:00:00Z`)
  const [result] = await transactionService.monthlyBalance({ userId, from, until })

  if (!result) return ctx.reply('No transactions yet for this period 📭')

  return await ctx.reply(
    `📊 <b>${monthToReadable(result.month)}</b>\n\n` +
      `+ Incomes: <b>$${centsToString(result.incomeTotal)}</b>\n` +
      `- Expenses: <b>$${centsToString(result.expenseTotal)}</b>\n` +
      `\n` +
      `💰 Balance: <b>$${centsToString(result.balance)}</b>`,
    { parse_mode: 'HTML' },
  )
}
