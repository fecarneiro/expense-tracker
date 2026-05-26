import { Router } from 'express'
import type { TransactionController } from './transaction.controller.js'

const router = Router()

export function transactionRouter(controller: TransactionController) {
  router.post('/', (req, res) => controller.create(req, res))
  router.get('/', (req, res) => controller.findAll(req, res))
  router.get('/:id', (req, res) => controller.findById(req, res))
  router.patch('/:id', (req, res) => controller.update(req, res))
  router.delete('/:id', (req, res) => controller.delete(req, res))

  return router
}
