import type { Request, Response } from 'express'
import { accessTokenConfig, generateToken } from '../../../shared/access-token.js'
import type { AuthService } from '../auth.service.js'
import { loginBodySchema, registerBodySchema } from './auth.http.dto.js'

export class AuthHttpController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response) {
    const data = registerBodySchema.parse(req.body)
    const user = await this.authService.register(data)
    res.status(201).json(user)
  }

  async login(req: Request, res: Response) {
    const data = loginBodySchema.parse(req.body)
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
