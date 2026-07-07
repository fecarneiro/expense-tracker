import { botAccountsTable } from './bot-accounts.schema.js'
import { botLinkingCodesTable } from './bot-codes.schema.js'
import { categoriesTable } from './category.schema.js'
import { transactionsTable } from './transaction.schema.js'
import { usersTable } from './user.schema.js'

export const schemas = {
  users: usersTable,
  transactions: transactionsTable,
  categories: categoriesTable,
  bot: botAccountsTable,
  botCodes: botLinkingCodesTable,
}
