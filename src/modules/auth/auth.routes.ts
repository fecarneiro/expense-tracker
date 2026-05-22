import { Router } from 'express'
import type { AuthController } from './auth.controller.js'

const router = Router()

export function authRouter(controller: AuthController) {
  router.post('/login', (req, res) => controller.login(req, res))
  router.post('/logout', (req, res) => controller.logout(req, res))
  return router
}
