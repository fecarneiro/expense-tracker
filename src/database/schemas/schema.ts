import { categoriesTable } from './category.schema.js'
import { telegramAccountsTable } from './telegram-accounts.schema.js'
import { telegramLinkingCodesTable } from './telegram-codes.schema.js'
import { transactionsTable } from './transaction.schema.js'
import { usersTable } from './user.schema.js'

export const schemas = {
  users: usersTable,
  transactions: transactionsTable,
  categories: categoriesTable,
  telegram: telegramAccountsTable,
  telegramCodes: telegramLinkingCodesTable,
}
