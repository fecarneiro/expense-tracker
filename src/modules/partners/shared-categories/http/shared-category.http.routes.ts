import { Router } from 'express'
import type { SharedCategoryHttpController } from './shared-category.http.controller.js'

export function sharedCategoryHttpRouter(controller: SharedCategoryHttpController) {
  const router = Router()

  router.get('/', (req, res) => controller.findAll(req, res))
  router.post('/mappings', (req, res) => controller.mapUserCategory(req, res))

  return router
}
