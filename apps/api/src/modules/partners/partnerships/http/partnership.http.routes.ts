import { Router } from 'express'
import type { PartnershipHttpController } from './partnership.http.controller.js'

export function partnershipHttpRouter(controller: PartnershipHttpController) {
  const router = Router()

  router.post('/linking-code', (req, res) => controller.createLinkingCode(req, res))
  router.get('/me', (req, res) => controller.getMe(req, res))
  router.post('/', (req, res) => controller.create(req, res))

  return router
}
