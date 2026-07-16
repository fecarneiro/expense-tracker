import { Router } from 'express'
import type { SharedExpenseHttpController } from './shared-expense.http.controller.js'

export function sharedExpenseHttpRouter(controller: SharedExpenseHttpController) {
  const router = Router()

  router.post('/', (req, res) => controller.create(req, res))

  return router
}
