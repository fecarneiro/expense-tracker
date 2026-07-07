import type { Request, Response } from 'express'
import type { BotService } from '../bot.service.js'

export class BotHttpController {
  constructor(private readonly botService: BotService) {}

  async createLinkingCode(req: Request, res: Response) {
    const userId = req.auth.userId
    const generatedLinkingCode = await this.botService.createLinkingCode({ userId })
    res.status(201).json(generatedLinkingCode)
  }
}
