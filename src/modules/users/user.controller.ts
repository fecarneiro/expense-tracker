import type { Request, Response } from 'express'
import { changePasswordSchema, deleteUserSchema } from './user.dto.js'
import type { UserService } from './user.service.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  async findById(req: Request, res: Response) {
    const userId = req.auth.userId
    const user = await this.userService.getProfile(userId)
    res.status(200).json(user)
  }

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
