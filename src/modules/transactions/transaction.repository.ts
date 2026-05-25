import { eq } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import {
  type NewTransaction,
  type Transaction,
  transactionsTable,
} from './transaction.entity.js'

export class TransactionRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewTransaction): Promise<Transaction | null> {
    const [transaction] = await this.database
      .insert(transactionsTable)
      .values(data)
      .returning()

    return transaction ?? null
  }

  async findById(id: string): Promise<Transaction | null> {
    const [transactions] = await this.database
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, id))

    return transactions ?? null
  }

  async delete(id: string) {
    await this.database
      .delete(transactionsTable)
      .where(eq(transactionsTable.id, id))
  }
}
