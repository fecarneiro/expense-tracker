import { Router } from 'express'
import type { SettlementHttpController } from './settlement.http.controller.js'

export function settlementHttpRouter(controller: SettlementHttpController) {
  const router = Router()

  router.get('/balance', (req, res) => controller.getPendingBalance(req, res))
  router.post('/', (req, res) => controller.settle(req, res))

  return router
}
