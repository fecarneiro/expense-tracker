import type { BotContext } from '../telegram.context.js'

export async function handleStart(ctx: BotContext) {
  return await ctx.reply(
    `
Welcome to Expense Tracker! 📊

Getting started:
1. Register your account and generate your linking code <a href="https://expenses.fecarneiro.dev/docs">here</a>.
2. Type the <code>/link</code> command followed by your 6-digit code (e.g., <code>/link 123456</code>).
`,
    { parse_mode: 'HTML' },
  )
}
