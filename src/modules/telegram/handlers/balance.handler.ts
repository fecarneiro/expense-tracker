import { monthToReadable } from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import type { AnalyticsService } from '../../analytics/analytics.service.js'
import type { BotContext } from '../telegram.context.js'

export async function handleMonthlyBalance(ctx: BotContext, analyticsService: AnalyticsService) {
  const { userId } = ctx
  const [result] = await analyticsService.monthlyBalance({ userId })

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
