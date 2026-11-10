import { isoDateTimeToReadable } from '../../../utils/date.utils.js'
import { centsToString } from '../../../utils/money.utils.js'
import type { BotContext } from '../../bot/bot.context.js'
import type { UserService } from '../../users/user.service.js'
import type { TransactionService } from '../transaction.service.js'

export async function handleLastTransactions(
  ctx: BotContext,
  transactionService: TransactionService,
  userService: Pick<UserService, 'getUserPreferences'>,
) {
  const { userId } = ctx
  const { data: transactions } = await transactionService.findManyWithCategory({ userId })

  if (transactions.length === 0) {
    return ctx.reply('No transactions yet 📭')
  }

  const { timeZone } = await userService.getUserPreferences({ id: userId })

  const message = transactions
    .map((t) => {
      const date = isoDateTimeToReadable(t.occurredAt, timeZone)
      const sign = t.transactionType === 'income' ? '+' : '-'
      const amount = centsToString(t.amountCents)
      const category = t.category.name

      return `🗓️ ${date}\n${sign} $${amount} | ${category}`
    })
    .join('\n\n')

  return ctx.reply(`Last transactions:\n\n${message}`, { parse_mode: 'HTML' })
}
