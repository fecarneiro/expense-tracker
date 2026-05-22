import type { Request, Response } from 'express'
import { ChangePasswordInput, CreateUserInput } from './user.dto.js'
import type { UserService } from './user.service.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response) {
    const data = CreateUserInput.parse(req.body)
    const user = await this.userService.createNewUser(data)
    res.status(201).json(user)
  }

  async update(req: Request, res: Response) {
    const data = ChangePasswordInput.parse(req.body)
    // TODO: get from authenticated user (req.user.id) via auth.middleware
    const userId = '123'
    await this.userService.changeUserPassword(userId, data)
    res.status(204).send()
  }

  async delete(_req: Request, res: Response) {
    // TODO: get from authenticated user (req.user.id) via auth.middleware
    const userId = '123'
    await this.userService.deleteUser(userId)
    res.status(204).send()
  }
}
