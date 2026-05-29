import { categoriesTable } from './category.schema.js'
import { transactionsTable } from './transaction.schema.js'
import { usersTable } from './user.schema.js'

export const schemas = {
  users: usersTable,
  transactions: transactionsTable,
  categories: categoriesTable,
}
