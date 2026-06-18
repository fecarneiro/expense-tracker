import { linkingCodeParser } from '../parsers/link-account.parser.js'
import type { BotContext } from '../telegram.context.js'
import type { TelegramService } from '../telegram.service.js'

export async function handleLinkAccount(ctx: BotContext, telegramService: TelegramService) {
  const telegramId = ctx.from?.id
  const message = ctx.match

  if (!telegramId) return
  if (typeof message !== 'string') return

  const codeInput = message.trim()

  if (!codeInput) {
    await ctx.reply(
      'Generate a linking code in the app, then add your 6-digit code to this command (e.g. 123456).',
    )
    return
  }

  const linkingCode = linkingCodeParser(codeInput)

  if (linkingCode == null) {
    await ctx.reply('Invalid code. Your linking code must be 6 digits (e.g. 123456).')
    return
  }

  await telegramService.verifyAndLinkAccount({
    telegramId,
    code: linkingCode,
  })

  await ctx.reply('Account linked successfully! You can now use /expense, /income, and /report.')
}
