import type { Request, Response } from 'express'
import type { TelegramService } from '../telegram.service.js'
import {
  generatedLinkingCodeHttpResponseSchema,
  linkTelegramAccountBodySchema,
  telegramHttpResponseSchema,
} from './telegram.http.dto.js'

export class TelegramHttpController {
  constructor(private readonly telegramService: TelegramService) {}

  async linkAccount(req: Request, res: Response) {
    const input = linkTelegramAccountBodySchema.parse(req.body)
    const telegramAccount = await this.telegramService.linkAccount(input)

    res.status(201).json(telegramHttpResponseSchema.parse(telegramAccount))
  }

  async createLinkingCode(req: Request, res: Response) {
    const userId = req.auth.userId
    const generatedLinkingCode = await this.telegramService.createLinkingCode({ userId })
    res.status(201).json(generatedLinkingCodeHttpResponseSchema.parse(generatedLinkingCode))
  }
}
