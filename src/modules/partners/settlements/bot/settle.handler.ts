import { InlineKeyboard } from 'grammy'
import { centsToString } from '../../../../utils/money.utils.js'
import type { BotConversation, BotConversationContext } from '../../../bot/bot.context.js'
import { CANCEL_HINT } from '../../../bot/handlers/cancel.handler.js'
import type { SettlementService } from '../settlement.service.js'

export function handleSettleConversation(settlementService: SettlementService) {
  return async function handleSettle(conversation: BotConversation, ctx: BotConversationContext) {
    const userId = await conversation.external((ctx) => ctx.userId)
    const partnership = await conversation.external((ctx) => ctx.partnership)

    if (!partnership) {
      return ctx.reply('You are not part of a partnership yet.')
    }

    const balance = await conversation.external(() => settlementService.getPendingBalance(userId))

    if (balance.totalAmountCents <= 0) {
      return ctx.reply('Nothing to settle right now.')
    }

    const amountLabel = centsToString(balance.totalAmountCents)
    const keyboard = new InlineKeyboard()
      .text(`Confirm ($${amountLabel})`, 'settle:confirm')
      .text('Cancel', 'settle:cancel')

    await ctx.reply(`Settle <b>$${amountLabel}</b> with your partner?${CANCEL_HINT}`, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })

    const choice = await conversation.waitForCallbackQuery(/^settle:(confirm|cancel)$/)

    if (choice.match[1] === 'cancel') {
      await choice.answerCallbackQuery()
      await choice.editMessageText('Settlement cancelled.')
      return
    }

    await choice.answerCallbackQuery()
    await choice.editMessageText('⏳ Settling...')

    const settlement = await conversation.external(() => settlementService.settle(userId))

    return ctx.reply(
      `Settlement done ✅\n\nAmount: <b>$${centsToString(settlement.totalAmountCents)}</b>`,
      { parse_mode: 'HTML' },
    )
  }
}
