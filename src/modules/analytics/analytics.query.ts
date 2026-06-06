import { desc, eq, sql, sum } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import type { GetMonthlyBalanceInput, GetMonthlyBalanceOutput } from './analytics.dto.js'

const monthSql = sql<string>`
  TO_CHAR(${transactionsTable.occurredOn}, 'YYYY-MM')
`

const signedAmountSql = sql<number>`
  CASE
    WHEN ${transactionsTable.transactionType} = 'income'
      THEN ${transactionsTable.amountInCents}
    WHEN ${transactionsTable.transactionType} = 'expense'
      THEN -${transactionsTable.amountInCents}
    ELSE 0
  END
`

export class AnalyticsQuery {
  constructor(private readonly database: Database) {}

  async monthlyBalance(data: GetMonthlyBalanceInput): Promise<GetMonthlyBalanceOutput[]> {
    const { userId } = data

    const monthlyBalance = await this.database
      .select({
        month: monthSql.mapWith(String),
        total: sum(signedAmountSql).mapWith(Number),
      })
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .groupBy(monthSql)
      .orderBy(desc(monthSql))

    return monthlyBalance
  }
}
