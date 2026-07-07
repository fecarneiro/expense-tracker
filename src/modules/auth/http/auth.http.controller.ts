import type { Request, Response } from 'express'
import { generateToken } from '../../../shared/access-token.js'
import { toLoginResponse, toRegisterResponse } from '../auth.mapper.js'
import { loginBodySchema, registerBodySchema } from '../auth.schemas.js'
import type { AuthService } from '../auth.service.js'

export class AuthHttpController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response) {
    const data = registerBodySchema.parse(req.body)
    const user = await this.authService.register(data)
    res.status(201).json(toRegisterResponse(user))
  }

  async login(req: Request, res: Response) {
    const data = loginBodySchema.parse(req.body)
    const user = await this.authService.verifyCredentials(data)

    const accessToken = await generateToken(user)

    res.status(200).json(toLoginResponse(user, accessToken))
  }
}
