import type { BotContext } from '../../../bot/bot.context.js'
import { linkingCodeParser } from '../../../linking-codes/linking-code.schemas.js'
import type { PartnershipService } from '../partnership.service.js'

export async function handlePartnershipJoin(
  ctx: BotContext,
  partnershipService: PartnershipService,
) {
  const message = ctx.match

  if (typeof message !== 'string') return

  const codeInput = message.trim()

  if (!codeInput) {
    await ctx.reply('Usage: /join_partner 123456')
    return
  }

  const code = linkingCodeParser(codeInput)

  if (code == null) {
    await ctx.reply('Invalid code. Your invite code must be 6 digits (e.g. 123456).')
    return
  }

  await partnershipService.createPartnership({
    inviteeId: ctx.userId,
    code,
  })

  await ctx.reply('Partnership created ✅ You can now use /shared and /balance.')
}
