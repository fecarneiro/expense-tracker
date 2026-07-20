import { isoDateTimeToReadable } from '../../../../utils/date.utils.js'
import { centsToString } from '../../../../utils/money.utils.js'
import type { BotContext } from '../../../bot/bot.context.js'
import type { SharedExpense } from '../../shared-expenses/shared-expense.types.js'
import type { SettlementService } from '../settlement.service.js'

const PENDING_REPORT_LIMIT = 20

function directionLabel(expense: SharedExpense, userId: string): string {
  return expense.owedUserId === userId ? 'Partner→you' : 'You→partner'
}

function compareByCreatedAtAsc(a: SharedExpense, b: SharedExpense): number {
  return a.createdAt.getTime() - b.createdAt.getTime()
}

export async function handlePendingSharedExpenses(
  ctx: BotContext,
  settlementService: SettlementService,
) {
  if (!ctx.partnership) {
    return ctx.reply('You are not part of a partnership yet.')
  }

  const balance = await settlementService.getPendingBalance(ctx.userId)

  if (balance.pendingExpenses.length === 0) {
    return ctx.reply('No pending shared expenses 📭')
  }

  const { userId } = ctx

  const youPaid = balance.pendingExpenses
    .filter((expense) => expense.owedUserId === balance.partnerId)
    .sort(compareByCreatedAtAsc)

  const youOwe = balance.pendingExpenses
    .filter((expense) => expense.owedUserId === userId)
    .sort(compareByCreatedAtAsc)

  const ordered = [...youPaid, ...youOwe]
  const shown = ordered.slice(0, PENDING_REPORT_LIMIT)
  const truncated = ordered.length > PENDING_REPORT_LIMIT

  const title = truncated
    ? `Pending shared (showing ${shown.length} of ${ordered.length}):`
    : `Pending shared:`

  // TODO - Timezone issue
  const message = shown
    .map((expense) => {
      const date = isoDateTimeToReadable(expense.createdAt.toISOString())
      const dir = directionLabel(expense, userId)
      const total = centsToString(expense.totalAmountCents)
      const owed = centsToString(expense.owedAmountCents)
      const descriptionLine = expense.description ? `\n${expense.description}` : ''

      return `🗓️ ${date}\n${dir} | $${total} total | $${owed} owed${descriptionLine}`
    })
    .join('\n\n')

  return ctx.reply(
    `${title}\n\n` +
      `${message}\n\n` +
      `You owe: <b>$${centsToString(balance.userTotals)}</b>\n` +
      `Partner owes you: <b>$${centsToString(balance.partnerTotals)}</b>`,
    { parse_mode: 'HTML' },
  )
}
