import { Router } from 'express'
import type { AnalyticsController } from './analytics.controller.js'

export function analyticRouter(controller: AnalyticsController) {
  const router = Router()

  router.get('/monthly-balance', (req, res) =>
    controller.monthlyBalance(req, res),
  )

  return router
}
