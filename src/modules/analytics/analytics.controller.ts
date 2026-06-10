import type { Request, Response } from 'express'
import { getMonthlyBalanceSchema } from './analytics.dto.js'
import type { AnalyticsService } from './analytics.service.js'

export class AnalyticsController {
  constructor(private readonly analyticService: AnalyticsService) {}

  async monthlyBalance(req: Request, res: Response) {
    const { startMonth, endMonth } = getMonthlyBalanceSchema.parse(req.query)
    const userId = req.auth.userId

    const monthlyBalance = await this.analyticService.monthlyBalance({
      userId,
      startMonth,
      endMonth,
    })

    res.status(200).json(monthlyBalance)
  }
}
