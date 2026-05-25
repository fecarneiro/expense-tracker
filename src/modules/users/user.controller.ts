import type { Request, Response } from 'express'
import { changePasswordSchema, deleteUserSchema } from './user.schemas.js'
import type { UserService } from './user.service.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  async update(req: Request, res: Response) {
    const data = changePasswordSchema.parse(req.body)
    const userId = req.auth.userId

    await this.userService.changePassword({
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    res.status(204).send()
  }

  async delete(req: Request, res: Response) {
    const data = deleteUserSchema.parse(req.body)
    const userId = req.auth.userId

    await this.userService.delete({ userId, password: data.password })
    res.status(204).send()
  }
}
