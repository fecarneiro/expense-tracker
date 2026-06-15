import { Router } from 'express'
import type { UserController } from './user.http.controller.js'

export function userRouter(controller: UserController) {
  const router = Router()

  router.get('/me', (req, res) => controller.findById(req, res))
  router.patch('/me/password', (req, res) => controller.update(req, res))
  router.delete('/me', (req, res) => controller.delete(req, res))

  return router
}
