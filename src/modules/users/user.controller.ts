import type { Request, Response } from 'express'
import {
  changePasswordSchema,
  createUserSchema,
  userIdParamsSchema,
} from './user.schemas.js'
import type { UserService } from './user.service.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body)
    const user = await this.userService.createNewUser(data)
    res.status(201).json(user)
  }

  async update(req: Request, res: Response) {
    const data = changePasswordSchema.parse(req.body)
    const userId = userIdParamsSchema.parse(req.params.id)
    await this.userService.changeUserPassword({
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    res.status(204).send()
  }

  async delete(req: Request, res: Response) {
    const userId = userIdParamsSchema.parse(req.params.id)
    await this.userService.deleteUser({ userId })
    res.status(204).send()
  }
}
