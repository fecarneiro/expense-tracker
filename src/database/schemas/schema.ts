import { categoriesTable } from './category.schema.js'
import { telegramTable } from './telegram.schema.js'
import { telegramCodesTable } from './telegram-codes.schema.js'
import { transactionsTable } from './transaction.schema.js'
import { usersTable } from './user.schema.js'

export const schemas = {
  users: usersTable,
  transactions: transactionsTable,
  categories: categoriesTable,
  telegram: telegramTable,
  telegramCodes: telegramCodesTable,
}
