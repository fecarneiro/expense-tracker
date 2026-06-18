import type { Bot } from 'grammy'
import type { BotContext } from './telegram.context.js'

export function registerBotCommands(bot: Bot<BotContext>) {
  bot.api.setMyCommands([
    { command: 'start', description: 'Start using Expense Tracker' },
    { command: 'link', description: 'Link an existing API account' },
    // { command: 'menu', description: 'Open main menu' },
    { command: 'expense', description: 'Add expense' },
    { command: 'income', description: 'Add income' },
    { command: 'last', description: 'View last transactions' },
    { command: 'report', description: 'View balance' },
    { command: 'me', description: 'Get Telegram ID' },
  ])
}
