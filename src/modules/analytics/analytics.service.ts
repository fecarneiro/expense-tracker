import {
  currentUtcMonth,
  monthToStartDate,
  nextMonth,
  subtractMonths,
} from '../../utils/date.utils.js'
import type { GetMonthlyBalanceInput, GetMonthlyBalanceOutput } from './analytics.dto.js'
import type { AnalyticsQuery } from './analytics.query.js'

const DEFAULT_MONTH_RANGE_SIZE = 3

export class AnalyticsService {
  constructor(private readonly analyticsQuery: AnalyticsQuery) {}

  async monthlyBalance(data: GetMonthlyBalanceInput): Promise<GetMonthlyBalanceOutput[]> {
    const endMonth = data.endMonth ?? currentUtcMonth()
    const startMonth = data.startMonth ?? subtractMonths(endMonth, DEFAULT_MONTH_RANGE_SIZE - 1)

    const monthlyBalance = await this.analyticsQuery.monthlyBalance({
      userId: data.userId,
      fromDate: monthToStartDate(startMonth),
      untilDate: monthToStartDate(nextMonth(endMonth)),
    })

    return monthlyBalance.map((row) => ({ ...row, balance: row.incomeTotal - row.expenseTotal }))
  }
}
