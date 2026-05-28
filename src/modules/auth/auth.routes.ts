import { Router } from 'express'
import type { AuthController } from './auth.controller.js'

export function authRouter(controller: AuthController) {
  const router = Router()

  router.post('/register', (req, res) => controller.register(req, res))
  router.post('/login', (req, res) => controller.login(req, res))
  router.post('/logout', (req, res) => controller.logout(req, res))

  return router
}
