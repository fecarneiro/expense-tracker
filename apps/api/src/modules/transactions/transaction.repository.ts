import { and, count, desc, eq, getTableColumns, gte, lt, sql, sum } from 'drizzle-orm'

import { isForeignKeyViolation } from '../../database/db.error.js'
import type { Database, DatabaseClient } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/categories.schema.js'
import {
  type NewTransactionRow,
  type TransactionRow,
  transactionsTable,
} from '../../database/schemas/transactions.schema.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import type {
  DeleteTransactionInput,
  FindExpenseCategoryTotalsInput,
  FindManyTransactionsRepositoryInput,
  FindMonthlyTotalsInRangeRepositoryInput,
  FindTransactionByIdInput,
  TransactionRange,
  TransactionWithCategory,
  UpdateTransactionInput,
} from './transaction.types.js'

function monthInTimeZoneSql(timeZone: string) {
  return sql<string>`
    to_char(
      date_trunc('month', ${transactionsTable.occurredAt} AT TIME ZONE ${timeZone}),
      'YYYY-MM'
    )
  `
}

const incomeTotalSql = sql<number>`
  coalesce(sum(case when ${transactionsTable.transactionType} = 'income'
    then ${transactionsTable.amountCents} else 0 end), 0)
`

const expenseTotalSql = sql<number>`
  coalesce(sum(case when ${transactionsTable.transactionType} = 'expense'
    then ${transactionsTable.amountCents} else 0 end), 0)
`

function inRange({ from, until }: TransactionRange) {
  return and(
    from ? gte(transactionsTable.occurredAt, from) : undefined,
    until ? lt(transactionsTable.occurredAt, until) : undefined,
  )
}

export class TransactionRepository {
  constructor(private readonly database: Database) {}

  async create(
    data: NewTransactionRow,
    client: DatabaseClient = this.database,
  ): Promise<TransactionRow | null> {
    try {
      const [transaction] = await client.insert(transactionsTable).values(data).returning()

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

  async findManyWithCategory(
    data: FindManyTransactionsRepositoryInput,
  ): Promise<{ rows: TransactionWithCategory[]; total: number }> {
    const where = and(eq(transactionsTable.userId, data.userId), inRange(data))

    const [countRow] = await this.database
      .select({ total: count().mapWith(Number) })
      .from(transactionsTable)
      .where(where)

    const rows = await this.database
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
      .where(where)
      .orderBy(desc(transactionsTable.occurredAt), desc(transactionsTable.id))
      .limit(data.limit)
      .offset(data.offset)

    return { rows, total: countRow?.total ?? 0 }
  }

  async findExpenseCategoryTotals(data: FindExpenseCategoryTotalsInput) {
    const totalCents = sum(transactionsTable.amountCents).mapWith(Number)

    return this.database
      .select({
        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,
        totalCents,
      })
      .from(transactionsTable)
      .innerJoin(
        categoriesTable,
        and(
          eq(transactionsTable.categoryId, categoriesTable.id),
          eq(transactionsTable.userId, categoriesTable.userId),
        ),
      )
      .where(
        and(
          eq(transactionsTable.userId, data.userId),
          eq(transactionsTable.transactionType, 'expense'),
          inRange(data),
        ),
      )
      .groupBy(categoriesTable.id, categoriesTable.name)
      .orderBy(desc(totalCents), categoriesTable.name)
  }

  async findMonthlyTotalsInRange(data: FindMonthlyTotalsInRangeRepositoryInput) {
    const { userId, timeZone, from, until } = data
    const month = monthInTimeZoneSql(timeZone)

    return this.database
      .select({
        month,
        incomeTotal: incomeTotalSql.mapWith(Number),
        expenseTotal: expenseTotalSql.mapWith(Number),
      })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.userId, userId), inRange({ from, until })))
      .groupBy(sql`1`) // 1 = month
      .orderBy(sql`1 desc`)
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
