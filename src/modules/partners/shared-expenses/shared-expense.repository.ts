import type { Database, DatabaseClient } from '../../../database/db.js'
import {
  type NewSharedExpenseRow,
  sharedExpensesTable,
} from '../../../database/schemas/partners/shared-expenses.schema.js'
import { SharedExpenseCreationError } from './shared-expense.errors.js'
import type { SharedExpense } from './shared-expense.types.js'

export class SharedExpenseRepository {
  constructor(private readonly db: Database) {}

  async create(
    data: NewSharedExpenseRow,
    client: DatabaseClient = this.db,
  ): Promise<SharedExpense> {
    const [sharedExpense] = await client.insert(sharedExpensesTable).values(data).returning()

    if (!sharedExpense) {
      throw new SharedExpenseCreationError()
    }

    return sharedExpense
  }
}
