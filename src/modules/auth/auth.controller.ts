import type { Request, Response } from 'express'
import { loginSchema, registerSchema } from './auth.dto.js'
import type { AuthService } from './auth.service.js'
import { generateToken } from './session/access-token.js'
import { cookieOptions } from './session/cookie-options.js'

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

    const token = await generateToken(user)

    res.cookie('token', token, cookieOptions)
    res.status(200).json(user)
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('token', cookieOptions)
    res.status(200).json()
  }
}
