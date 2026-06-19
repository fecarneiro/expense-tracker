import type { BotContext } from '../telegram.context.js'

export async function handleStart(ctx: BotContext) {
  return await ctx.reply(
    `
Welcome to Expense Tracker! 📊

Getting started:
1. First, visit the <a href="https://expenses.fecarneiro.dev/docs">API Documentation</a>.
2. Register a new user.
3. Login to get a JWT token.
4. Get your telegram linking code using your JWT token to get a 6-digit code.
5. In Telegram, type the link command with your 6-digit code.
`,
    { parse_mode: 'HTML' },
  )
}
