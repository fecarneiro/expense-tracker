import { Router } from 'express'
import type { AuthHttpController } from './auth.http.controller.js'

export function authHttpRouter(controller: AuthHttpController) {
  const router = Router()

  router.post('/register', (req, res) => controller.register(req, res))
  router.post('/login', (req, res) => controller.login(req, res))

  return router
}
