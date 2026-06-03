import type { Request, Response } from 'express'
import { telegramLinkAccountInput } from './telegram.dto.js'
import type { TelegramService } from './telegram.service.js'

export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  async linkAccount(req: Request, res: Response): Promise<void> {
    const input = telegramLinkAccountInput.parse(req.body)

    const telegramAccount = await this.telegramService.linkAccount(input)

    res.status(201).json(telegramAccount)
  }
}
