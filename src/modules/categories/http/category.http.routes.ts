import { Router } from 'express'
import type { CategoryHttpController } from './category.controller.http.js'

export function categoryHttpRouter(controller: CategoryHttpController) {
  const router = Router()

  router.post('/', (req, res) => controller.create(req, res))
  router.get('/:id', (req, res) => controller.findById(req, res))
  router.get('/', (req, res) => controller.findAll(req, res))
  router.patch('/:id', (req, res) => controller.update(req, res))
  router.delete('/:id', (req, res) => controller.delete(req, res))

  return router
}
