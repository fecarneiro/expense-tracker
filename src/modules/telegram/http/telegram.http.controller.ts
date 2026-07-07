import type { Request, Response } from 'express'
import type { TelegramService } from '../telegram.service.js'

export class TelegramHttpController {
  constructor(private readonly telegramService: TelegramService) {}

  async createLinkingCode(req: Request, res: Response) {
    const userId = req.auth.userId
    const generatedLinkingCode = await this.telegramService.createLinkingCode({ userId })
    res.status(201).json(generatedLinkingCode)
  }
}
