import type { Bot } from 'grammy'
import type { BotContext } from '../telegram.context.js'

export function registerBotCommands(bot: Bot<BotContext>) {
  bot.api.setMyCommands([
    { command: 'expense', description: 'Log an expense' },
    { command: 'income', description: 'Log income' },
    { command: 'report', description: 'Monthly summary' },
  ])
}
