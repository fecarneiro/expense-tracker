import { Router } from 'express'
import type { TelegramHttpController } from './telegram.http.controller.js'

export function telegramHttpRouter(controller: TelegramHttpController) {
  const router = Router()

  router.post('/link-account', (req, res) => controller.linkAccount(req, res))
  router.get('/generate-linking-code', (req, res) => controller.createLinkingCode(req, res))

  return router
}
