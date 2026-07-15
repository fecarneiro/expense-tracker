import type { Bot } from 'grammy'
import type { BotContext } from './bot.context.js'

export function registerBotCommands(bot: Bot<BotContext>) {
  bot.api.setMyCommands([
    { command: 'start', description: 'Start using Expense Tracker' },
    { command: 'link', description: 'Link an existing API account' },
    { command: 'cancel', description: 'Cancel the current conversation' },
    { command: 'expense', description: 'Add expense' },
    { command: 'income', description: 'Add income' },
    { command: 'shared', description: 'Add shared expense with partner' },
    { command: 'balance', description: 'View partner balance' },
    { command: 'settle', description: 'Settle partner balance' },
    { command: 'invite_partner', description: 'Invite a partner' },
    { command: 'join_partner', description: 'Join a partnership with an invite code' },
    { command: 'map_category', description: 'Map your category to a shared category' },
    { command: 'last', description: 'View last transactions' },
    { command: 'report', description: 'View balance' },
  ])
}
