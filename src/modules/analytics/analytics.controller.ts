import type { Request, Response } from 'express'
import type { AnalyticsService } from './analytics.service.js'

export class AnalyticsController {
  constructor(private readonly analyticService: AnalyticsService) {}

  async monthlyBalance(req: Request, res: Response) {
    const userId = req.auth.userId

    const monthlyBalance = await this.analyticService.monthlyBalance({
      userId,
    })

    res.status(200).json(monthlyBalance)
  }
}
