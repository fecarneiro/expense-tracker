import { isoDateTimeToReadable } from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import type { BotContext } from '../../bot/bot.context.js'
import type { TransactionService } from '../transaction.service.js'

export async function handleLastTransactions(
  ctx: BotContext,
  transactionService: TransactionService,
) {
  const { userId } = ctx
  const transactions = await transactionService.findManyWithCategory({ userId })

  if (transactions.length === 0) {
    return ctx.reply('No transactions yet 📭')
  }

  // TODO - Timezone issue
  const message = transactions
    .map((t) => {
      const date = isoDateTimeToReadable(t.occurredAt)
      const sign = t.transactionType === 'income' ? '+' : '-'
      const amount = centsToString(t.amountCents)
      const category = t.category.name

      return `🗓️ ${date}\n${sign} $${amount} | ${category}`
    })
    .join('\n\n')

  return ctx.reply(`Last transactions:\n\n${message}`, { parse_mode: 'HTML' })
}
