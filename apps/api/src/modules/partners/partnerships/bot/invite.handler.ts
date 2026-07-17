import type { BotContext } from '../../../bot/bot.context.js'
import { LINKING_CODE } from '../../../linking-codes/linking-code.constants.js'
import type { PartnershipService } from '../partnership.service.js'

export async function handlePartnershipInvite(
  ctx: BotContext,
  partnershipService: PartnershipService,
) {
  const linkingCode = await partnershipService.createLinkingCode(ctx.userId)
  const ttlMinutes = LINKING_CODE.TTL_MS / (60 * 1000)

  return ctx.reply(
    `Share this code with your partner:\n\n` +
      `<b>${linkingCode.code}</b>\n\n` +
      `It expires in ${ttlMinutes} minutes.\n` +
      `They should run /join_partner ${linkingCode.code}`,
    { parse_mode: 'HTML' },
  )
}
