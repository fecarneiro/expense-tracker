import type { Request, Response } from 'express'
import { accessTokenConfig, generateToken } from '../../shared/access-token.js'
import { loginSchema, registerSchema } from './auth.dto.js'
import type { AuthService } from './auth.service.js'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body)
    const user = await this.authService.register(data)
    res.status(201).json(user)
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body)
    const user = await this.authService.verifyCredentials(data)

    const accessToken = await generateToken(user)

    res.status(200).json({
      user,
      access_token: accessToken,
      token_type: accessTokenConfig.tokenType,
      expires_in: accessTokenConfig.expiresInSeconds,
    })
  }
}
