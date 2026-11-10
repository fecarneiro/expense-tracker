import { loginRequestSchema } from '@expense-tracker/contracts'
import type { Request, Response } from 'express'
import { generateToken } from '../../../shared/access-token.js'
import { userCredentialsBodySchema } from '../../users/user.schemas.js'
import { toLoginResponse } from '../auth.mapper.js'
import type { AuthService } from '../auth.service.js'

export class AuthHttpController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response) {
    const data = userCredentialsBodySchema.parse(req.body)
    const user = await this.authService.register(data)
    res.status(201).json(user)
  }

  async login(req: Request, res: Response) {
    const data = loginRequestSchema.parse(req.body)
    const user = await this.authService.verifyCredentials(data)

    const accessToken = await generateToken(user)

    res.status(200).json(toLoginResponse(user, accessToken))
  }
}
