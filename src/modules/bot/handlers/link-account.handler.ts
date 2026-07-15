import { linkingCodeParser } from '../../linking-codes/linking-code.schemas.js'
import type { BotContext } from '../bot.context.js'
import type { BotService } from '../bot.service.js'

export async function handleLinkAccount(ctx: BotContext, botService: BotService) {
  const telegramId = ctx.from?.id
  const message = ctx.match

  if (!telegramId) return
  if (typeof message !== 'string') return

  const codeInput = message.trim()

  if (!codeInput) {
    await ctx.reply(
      'Generate a linking code in the API, then run the link command and add your 6-digit code.',
      { parse_mode: 'HTML' },
    )
    return
  }

  const linkingCode = linkingCodeParser(codeInput)

  if (linkingCode == null) {
    await ctx.reply('Invalid code. Your linking code must be 6 digits (e.g. 123456).')
    return
  }

  await botService.verifyAndLinkAccount({
    telegramId,
    code: linkingCode,
    purpose: 'bot_link',
  })

  await ctx.reply(
    'Account linked successfully! You can now use /expense, /income to register your first transactions.',
  )
}
