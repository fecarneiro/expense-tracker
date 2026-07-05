import { isoDateTimeToReadable } from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import {
  LIST_DEFAULT_LIMIT,
  LIST_DEFAULT_OFFSET,
} from '../../transactions/transaction.constants.js'
import type { TransactionService } from '../../transactions/transaction.service.js'
import type { BotContext } from '../telegram.context.js'

export async function handleLastTransactions(
  ctx: BotContext,
  transactionService: TransactionService,
) {
  const { userId } = ctx
  const transactions = await transactionService.findManyWithCategory({
    userId,
    limit: LIST_DEFAULT_LIMIT,
    offset: LIST_DEFAULT_OFFSET,
  })

  if (transactions.length === 0) {
    return ctx.reply('No transactions yet 📭')
  }

  // TODO - Timezone issue
  const message = transactions
    .map((t) => {
      const date = isoDateTimeToReadable(t.occurredAt)
      const sign = t.transactionType === 'income' ? '+' : '-'
      const amount = centsToString(t.amountInCents)
      const category = t.category.name

      return `🗓️ ${date}\n${sign} $${amount} | ${category}`
    })
    .join('\n\n')

  return ctx.reply(`Last transactions:\n\n${message}`, { parse_mode: 'HTML' })
}
