import type { Request, Response } from 'express'
import { generateToken } from './access-token.js'
import { loginSchema } from './auth.schemas.js'
import type { AuthService } from './auth.service.js'
import { cookieOptions } from './cookie.js'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body)
    const user = await this.authService.verifyUserCredentials(data)

    const token = await generateToken(user)

    res.cookie('token', token, cookieOptions)
    res.status(200).json(user)
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('token', cookieOptions)
    res.status(200).json()
  }
}
