import { Router } from 'express'
import type { AnalyticsController } from './analytics.controller.js'

export function analyticRouter(controller: AnalyticsController) {
  const router = Router()

  router.get('/balances', (req, res) => controller.monthlyBalance(req, res))

  return router
}
