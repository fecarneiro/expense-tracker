import type { Request, Response } from 'express'

import { createUniqueTelegramLinkingCodeSchema, linkTelegramAccountSchema } from './telegram.dto.js'
import type { TelegramService } from './telegram.service.js'

export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  async linkAccount(req: Request, res: Response) {
    const input = linkTelegramAccountSchema.parse(req.body)

    const telegramAccount = await this.telegramService.linkAccount(input)

    res.status(201).json(telegramAccount)
  }

  async createUniqueTelegramLinkingCode(req: Request, res: Response) {
    const input = createUniqueTelegramLinkingCodeSchema.parse(req.body)

    const generatedLinkingCode = await this.telegramService.createUniqueTelegramLinkingCode(input)
    res.status(201).json(generatedLinkingCode)
  }
}
