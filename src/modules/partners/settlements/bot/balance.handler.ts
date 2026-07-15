import { centsToString } from '../../../../utils/money.utils.js'
import type { BotContext } from '../../../bot/bot.context.js'
import type { SettlementService } from '../settlement.service.js'

export async function handlePartnershipBalance(
  ctx: BotContext,
  settlementService: SettlementService,
) {
  if (!ctx.partnership) {
    return ctx.reply('You are not part of a partnership yet.')
  }

  const balance = await settlementService.getPendingBalance(ctx.userId)

  const youOwe = centsToString(balance.userTotals)
  const partnerOwes = centsToString(balance.partnerTotals)

  let summaryLine: string
  if (balance.totalAmountCents > 0) {
    summaryLine = `To settle: you pay <b>$${centsToString(balance.totalAmountCents)}</b>`
  } else if (balance.totalAmountCents < 0) {
    summaryLine = `To settle: partner pays <b>$${centsToString(Math.abs(balance.totalAmountCents))}</b>`
  } else {
    summaryLine = 'Nothing to settle — you are even.'
  }

  return ctx.reply(
    `🤝 <b>Partnership balance</b>\n\n` +
      `You owe: <b>$${youOwe}</b>\n` +
      `Partner owes you: <b>$${partnerOwes}</b>\n` +
      summaryLine,
    { parse_mode: 'HTML' },
  )
}
