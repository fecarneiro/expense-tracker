import { and, eq } from 'drizzle-orm'
import { isForeignKeyViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../categories/category.entity.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import {
  type NewTransaction,
  type PublicTransactionWithCategory,
  type Transaction,
  transactionsTable,
} from './transaction.entity.js'
import type {
  DeleteTransactionInput,
  FindAllTransactionsInput,
  FindTransactionByIdInput,
  UpdateTransactionInput,
} from './transaction.schema.js'

const transactionWithCategoryColumns = {
  id: transactionsTable.id,
  type: transactionsTable.type,
  amountInCents: transactionsTable.amountInCents,
  description: transactionsTable.description,
  createdAt: transactionsTable.createdAt,
  category: {
    id: categoriesTable.id,
    name: categoriesTable.name,
  },
}

export class TransactionRepository {
  constructor(private readonly database: Database) {}

  async create(
    data: NewTransaction,
  ): Promise<PublicTransactionWithCategory | null> {
    try {
      const [created] = await this.database
        .insert(transactionsTable)
        .values(data)
        .returning({ id: transactionsTable.id })

      if (!created) return null

      return this.findById({ id: created.id, userId: data.userId })
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryNotFoundError()
      }
      throw err
    }
  }

  async update(
    data: UpdateTransactionInput,
  ): Promise<PublicTransactionWithCategory | null> {
    const { id, userId, ...updateData } = data
    try {
      const [updated] = await this.database
        .update(transactionsTable)
        .set(updateData)
        .where(
          and(
            eq(transactionsTable.id, id),
            eq(transactionsTable.userId, userId),
          ),
        )
        .returning({ id: transactionsTable.id })

      if (!updated) return null

      return this.findById({ id: updated.id, userId })
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryNotFoundError()
      }
      throw err
    }
  }

  async findById(
    data: FindTransactionByIdInput,
  ): Promise<PublicTransactionWithCategory | null> {
    const [transaction] = await this.database
      .select(transactionWithCategoryColumns)
      .from(transactionsTable)
      .innerJoin(
        categoriesTable,
        eq(transactionsTable.categoryId, categoriesTable.id),
      )
      .where(
        and(
          eq(transactionsTable.id, data.id),
          eq(transactionsTable.userId, data.userId),
        ),
      )

    return transaction ?? null
  }

  async findAll(
    data: FindAllTransactionsInput,
  ): Promise<PublicTransactionWithCategory[]> {
    const transactions = await this.database
      .select(transactionWithCategoryColumns)
      .from(transactionsTable)
      .innerJoin(
        categoriesTable,
        eq(transactionsTable.categoryId, categoriesTable.id),
      )
      .where(eq(transactionsTable.userId, data.userId))

    return transactions
  }

  async delete(
    data: DeleteTransactionInput,
  ): Promise<Pick<Transaction, 'id'> | null> {
    const [transaction] = await this.database
      .delete(transactionsTable)
      .where(
        and(
          eq(transactionsTable.id, data.id),
          eq(transactionsTable.userId, data.userId),
        ),
      )
      .returning({ id: transactionsTable.id })

    if (!transaction) return null

    return transaction
  }
}
