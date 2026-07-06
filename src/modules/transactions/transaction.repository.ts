import { and, desc, eq, getTableColumns, gte, lt, sql } from 'drizzle-orm'

import { isForeignKeyViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import {
  type NewTransactionRow,
  type TransactionRow,
  transactionsTable,
} from '../../database/schemas/transaction.schema.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import type {
  DeleteTransactionInput,
  FindManyTransactionsInput,
  FindMonthlyTotalsInRangeInput,
  FindTransactionByIdInput,
  MonthlyTotalsRow,
  TransactionWithCategory,
  UpdateTransactionInput,
} from './transaction.types.js'

const monthSql = sql<string>`
  to_char(date_trunc('month', ${transactionsTable.occurredAt}), 'YYYY-MM')
`

const incomeTotalSql = sql<number>`
  coalesce(sum(case when ${transactionsTable.transactionType} = 'income'
    then ${transactionsTable.amountInCents} else 0 end), 0)
`

const expenseTotalSql = sql<number>`
  coalesce(sum(case when ${transactionsTable.transactionType} = 'expense'
    then ${transactionsTable.amountInCents} else 0 end), 0)
`

export class TransactionRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewTransactionRow): Promise<TransactionRow | null> {
    try {
      const [transaction] = await this.database.insert(transactionsTable).values(data).returning()

      return transaction ?? null
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryNotFoundError()
      }
      throw err
    }
  }

  async update(data: UpdateTransactionInput): Promise<Pick<TransactionRow, 'id'> | null> {
    const { id, userId, ...updateData } = data

    try {
      const [updated] = await this.database
        .update(transactionsTable)
        .set(updateData)
        .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))
        .returning({ id: transactionsTable.id })

      return updated ?? null
    } catch (err) {
      if (isForeignKeyViolation(err, 'transactions_category_user_fk')) {
        throw new CategoryNotFoundError()
      }
      throw err
    }
  }

  async findOneByIdWithCategory(
    data: FindTransactionByIdInput,
  ): Promise<TransactionWithCategory | null> {
    const [transaction] = await this.database
      .select({
        ...getTableColumns(transactionsTable),
        category: {
          id: categoriesTable.id,
          name: categoriesTable.name,
        },
      })
      .from(transactionsTable)
      .innerJoin(
        categoriesTable,
        and(
          eq(transactionsTable.categoryId, categoriesTable.id),
          eq(transactionsTable.userId, categoriesTable.userId),
        ),
      )
      .where(and(eq(transactionsTable.id, data.id), eq(transactionsTable.userId, data.userId)))

    return transaction ?? null
  }

  async findManyWithCategory(data: FindManyTransactionsInput): Promise<TransactionWithCategory[]> {
    return this.database
      .select({
        ...getTableColumns(transactionsTable),
        category: {
          id: categoriesTable.id,
          name: categoriesTable.name,
        },
      })
      .from(transactionsTable)
      .innerJoin(
        categoriesTable,
        and(
          eq(transactionsTable.categoryId, categoriesTable.id),
          eq(transactionsTable.userId, categoriesTable.userId),
        ),
      )
      .where(eq(transactionsTable.userId, data.userId))
      .orderBy(desc(transactionsTable.occurredAt), desc(transactionsTable.id))
      .limit(data.limit)
      .offset(data.offset)
  }

  async findMonthlyTotalsInRange(data: FindMonthlyTotalsInRangeInput): Promise<MonthlyTotalsRow[]> {
    const { userId, from, until } = data

    return this.database
      .select({
        month: monthSql,
        incomeTotal: incomeTotalSql.mapWith(Number),
        expenseTotal: expenseTotalSql.mapWith(Number),
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          gte(transactionsTable.occurredAt, from),
          lt(transactionsTable.occurredAt, until),
        ),
      )
      .groupBy(monthSql)
      .orderBy(desc(monthSql))
  }

  async delete(data: DeleteTransactionInput): Promise<Pick<TransactionRow, 'id'> | null> {
    const { id, userId } = data

    const [deleted] = await this.database
      .delete(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))
      .returning({ id: transactionsTable.id })

    return deleted ?? null
  }
}
