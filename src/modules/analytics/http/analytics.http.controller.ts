import type { Request, Response } from 'express'
import type { AnalyticsService } from '../analytics.service.js'
import {
  monthlyBalanceHttpResponseSchema,
  monthlyBalanceQuerySchema,
} from './analytics.http.dto.js'

export class AnalyticsHttpController {
  constructor(private readonly analyticService: AnalyticsService) {}

  async monthlyBalance(req: Request, res: Response) {
    const { startMonth, endMonth } = monthlyBalanceQuerySchema.parse(req.query)
    const userId = req.auth.userId

    const monthlyBalance = await this.analyticService.monthlyBalance({
      userId,
      startMonth,
      endMonth,
    })

    res.status(200).json(monthlyBalanceHttpResponseSchema.parse(monthlyBalance))
  }
}
