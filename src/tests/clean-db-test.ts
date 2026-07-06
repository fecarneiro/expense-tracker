import type { Database } from '../database/db.js'
import { categoriesTable } from '../database/schemas/category.schema.js'
import { transactionsTable } from '../database/schemas/transaction.schema.js'
import { usersTable } from '../database/schemas/user.schema.js'

export async function cleanDbTest(dbTest: Database) {
  await dbTest.delete(transactionsTable)
  await dbTest.delete(categoriesTable)
  await dbTest.delete(usersTable)
}
