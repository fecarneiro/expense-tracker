import { Router } from 'express'
import type { UserHttpController } from './user.http.controller.js'

export function userHttpRouter(controller: UserHttpController) {
  const router = Router()

  router.get('/me', (req, res) => controller.getCurrentUser(req, res))
  router.patch('/me/password', (req, res) => controller.changePassword(req, res))
  router.delete('/me', (req, res) => controller.delete(req, res))

  return router
}
