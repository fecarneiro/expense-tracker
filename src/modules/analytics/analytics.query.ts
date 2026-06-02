import { eq, sql, sum } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import type {
  GetMonthlyBalanceInput,
  GetMonthlyBalanceOutput,
} from './analytics.dto.js'

const monthlyGroup = sql<string>`
TO_CHAR(
  DATE_TRUNC(
    'month',
      ${transactionsTable.createdAt}
    ),
    'YYYY-MM'
  )
`

export class AnalyticsQuery {
  constructor(private readonly database: Database) {}

  async monthlyBalance(
    data: GetMonthlyBalanceInput,
  ): Promise<GetMonthlyBalanceOutput[]> {
    const { userId } = data

    const monthlyBalance = await this.database
      .select({
        month: monthlyGroup.mapWith(String),
        total: sum(transactionsTable.amountInCents).mapWith(Number),
      })
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .groupBy(monthlyGroup)
      .orderBy(monthlyGroup)

    return monthlyBalance
  }
}
