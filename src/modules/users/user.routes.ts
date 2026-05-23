import { Router } from 'express'
import type { UserController } from './user.controller.js'

const router = Router()

export function userRouter(controller: UserController) {
  router.post('/', (req, res) => controller.create(req, res))
  router.patch('/:id', (req, res) => controller.update(req, res))
  router.delete('/:id', (req, res) => controller.delete(req, res))

  return router
}
