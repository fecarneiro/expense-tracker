import { Router } from 'express'
import type { SharedExpenseHttpController } from './shared-expense.http.controller.js'

export function sharedExpenseHttpRouter(controller: SharedExpenseHttpController) {
  const router = Router()

  router.post('/batch', (req, res) => controller.createMany(req, res))
  router.post('/', (req, res) => controller.create(req, res))
  router.get('/', (req, res) => controller.list(req, res))

  return router
}
