import { Router } from 'express'
import type { BotHttpController } from './bot.http.controller.js'

export function botHttpRouter(controller: BotHttpController) {
  const router = Router()

  router.get('/generate-linking-code', (req, res) => controller.createLinkingCode(req, res))

  return router
}
