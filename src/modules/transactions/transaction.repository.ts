import { and, desc, eq } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { isForeignKeyViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import type {
  CreateTransactionInput,
  DeleteTransactionInput,
  FindAllTransactionsInput,
  FindTransactionByIdInput,
  PublicTransactionWithCategory,
  Transaction,
  UpdateTransactionInput,
} from './transaction.types.js'

const publicTransactionColumns = (source: Record<keyof Transaction, AnyPgColumn>) => ({
  id: source.id,
  occurredOn: source.occurredOn,
  transactionType: source.transactionType,
  amountInCents: source.amountInCents,
  notes: source.notes,
  createdAt: source.createdAt,
  category: { id: categoriesTable.id, name: categoriesTable.name },
})

export class TransactionRepository {
  constructor(private readonly database: Database) {}

  async create(data: CreateTransactionInput): Promise<PublicTransactionWithCategory | null> {
    try {
      const inserted = this.database
        .$with('inserted')
        .as(this.database.insert(transactionsTable).values(data).returning())

      const [transaction] = await this.database
        .with(inserted)
        .select(publicTransactionColumns(inserted))
        .from(inserted)
        .innerJoin(categoriesTable, eq(inserted.categoryId, categoriesTable.id))

      return transaction ?? null
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryNotFoundError()
      }
      throw err
    }
  }

  async update(data: UpdateTransactionInput): Promise<PublicTransactionWithCategory | null> {
    const { id, userId, ...updateData } = data

    try {
      const updated = this.database.$with('updated').as(
        this.database
          .update(transactionsTable)
          .set(updateData)
          .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))
          .returning(),
      )

      const [transaction] = await this.database
        .with(updated)
        .select(publicTransactionColumns(updated))
        .from(updated)
        .innerJoin(categoriesTable, eq(updated.categoryId, categoriesTable.id))

      return transaction ?? null
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryNotFoundError()
      }
      throw err
    }
  }

  async findById(data: FindTransactionByIdInput): Promise<PublicTransactionWithCategory | null> {
    const [transaction] = await this.database
      .select(publicTransactionColumns(transactionsTable))
      .from(transactionsTable)
      .innerJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
      .where(and(eq(transactionsTable.id, data.id), eq(transactionsTable.userId, data.userId)))

    return transaction ?? null
  }

  async findAll(data: FindAllTransactionsInput): Promise<PublicTransactionWithCategory[]> {
    const { limit = 10, offset = 0 } = data
    const transactions = await this.database
      .select(publicTransactionColumns(transactionsTable))
      .from(transactionsTable)
      .innerJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
      .where(eq(transactionsTable.userId, data.userId))
      .orderBy(desc(transactionsTable.occurredOn), desc(transactionsTable.id))
      .limit(limit)
      .offset(offset)

    return transactions
  }

  async delete(data: DeleteTransactionInput): Promise<Pick<Transaction, 'id'> | null> {
    const [transaction] = await this.database
      .delete(transactionsTable)
      .where(and(eq(transactionsTable.id, data.id), eq(transactionsTable.userId, data.userId)))
      .returning({ id: transactionsTable.id })

    if (!transaction) return null

    return transaction
  }
}
