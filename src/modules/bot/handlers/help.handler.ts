import type { BotContext } from '../bot.context.js'

const HELP_MESSAGE = `
<b>Expense Tracker — commands</b>

<b>Account</b>
/start — welcome &amp; setup
/link — link your API account
/cancel — cancel the current flow
/help — this message
/invite_partner — invite someone to partner up
/join_partner — join with an invite code

<b>Yours</b>
/expense — add an expense (step by step)
/income — add an income (step by step)
/last — last transactions
/report — monthly totals

<b>Partnership</b>
/shared — add a shared expense
/balance — who owes what
/pending — open shared expenses
/settle — clear the current balance
/map_category — map your categories to shared ones
`.trim()

export async function handleHelp(ctx: BotContext) {
  return ctx.reply(HELP_MESSAGE, { parse_mode: 'HTML' })
}
