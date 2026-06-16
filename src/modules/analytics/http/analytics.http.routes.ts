import { Router } from 'express'
import type { AnalyticsHttpController } from './analytics.http.controller.js'

export function analyticsHttpRouter(controller: AnalyticsHttpController) {
  const router = Router()

  router.get('/balances', (req, res) => controller.monthlyBalance(req, res))

  return router
}
