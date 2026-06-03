import { Router } from 'express'
import type { TelegramController } from './telegram.controller.js'

export function telegramRouter(controller: TelegramController) {
  const router = Router()

  router.post('/link-account', (req, res) => controller.linkAccount(req, res))

  return router
}
