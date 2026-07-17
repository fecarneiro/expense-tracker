import type { BotContext } from '../bot.context.js'

export const CANCEL_HINT = '\n\nYou can /cancel at any time.'

export async function handleCancel(ctx: BotContext) {
  await ctx.conversation.exitAll()
  await ctx.reply('Operation canceled.')
}
