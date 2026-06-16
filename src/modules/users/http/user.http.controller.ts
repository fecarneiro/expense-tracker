import type { Request, Response } from 'express'
import type { UserService } from '../user.service.js'
import {
  changePasswordBodySchema,
  deleteUserBodySchema,
  userHttpResponseSchema,
} from './user.http.dto.js'

export class UserHttpController {
  constructor(private readonly userService: UserService) {}

  async getCurrentUser(req: Request, res: Response) {
    const userId = req.auth.userId
    const user = await this.userService.getCurrentUser({ id: userId })
    res.status(200).json(userHttpResponseSchema.parse(user))
  }

  async changePassword(req: Request, res: Response) {
    const data = changePasswordBodySchema.parse(req.body)
    const userId = req.auth.userId

    await this.userService.changePassword({
      id: userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    res.status(204).send()
  }

  async delete(req: Request, res: Response) {
    const data = deleteUserBodySchema.parse(req.body)
    const userId = req.auth.userId

    await this.userService.delete({ id: userId, password: data.password })
    res.status(204).send()
  }
}
