import { Router } from 'express'
import type { CategoryController } from './category.controller.js'

export function categoryRouter(controller: CategoryController) {
  const router = Router()

  router.post('/', (req, res) => controller.create(req, res))
  router.get('/:id', (req, res) => controller.findById(req, res))
  router.get('/', (req, res) => controller.findAll(req, res))
  router.patch('/:id', (req, res) => controller.update(req, res))
  router.delete('/:id', (req, res) => controller.delete(req, res))

  return router
}
