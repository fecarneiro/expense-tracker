import { Router } from 'express'
import type { TelegramHttpController } from './telegram.http.controller.js'

export function telegramHttpRouter(controller: TelegramHttpController) {
  const router = Router()

  router.get('/generate-linking-code', (req, res) => controller.createLinkingCode(req, res))

  return router
}
