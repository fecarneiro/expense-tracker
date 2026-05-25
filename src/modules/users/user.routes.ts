import { Router } from 'express'
import type { UserController } from './user.controller.js'

const router = Router()

export function userRouter(controller: UserController) {
  router.patch('/me/password', (req, res) => controller.update(req, res))
  router.delete('/me', (req, res) => controller.delete(req, res))

  return router
}
