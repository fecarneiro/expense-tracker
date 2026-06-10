import { and, desc, eq, gte, lt, sql } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import type { GetMonthlyBalanceOutputQuery, GetMonthlyBalanceQuery } from './analytics.dto.js'

const monthSql = sql<string>`
  TO_CHAR(date_trunc('month', ${transactionsTable.occurredOn}), 'YYYY-MM')
`
const incomeTotalSql = sql<number>`
  coalesce(sum(case when ${transactionsTable.transactionType} = 'income' then ${transactionsTable.amountInCents} else 0 end), 0)
`

const expenseTotalSql = sql<number>`
  coalesce(sum(case when ${transactionsTable.transactionType} = 'expense' then ${transactionsTable.amountInCents} else 0 end), 0)
`

export class AnalyticsQuery {
  constructor(private readonly database: Database) {}

  async monthlyBalance(data: GetMonthlyBalanceQuery): Promise<GetMonthlyBalanceOutputQuery[]> {
    const { userId, fromDate, untilDate } = data

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
          gte(transactionsTable.occurredOn, fromDate),
          lt(transactionsTable.occurredOn, untilDate),
        ),
      )
      .groupBy(monthSql)
      .orderBy(desc(monthSql))
  }
}
