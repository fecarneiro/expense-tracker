import type { GetMonthlyBalanceInput, GetMonthlyBalanceOutput } from './analytics.dto.js'
import type { AnalyticsQuery } from './analytics.query.js'

export class AnalyticsService {
  constructor(private readonly analyticsQuery: AnalyticsQuery) {}

  async monthlyBalance(data: GetMonthlyBalanceInput): Promise<GetMonthlyBalanceOutput[]> {
    const monthlyBalance = await this.analyticsQuery.monthlyBalance(data)

    return monthlyBalance
  }
}
