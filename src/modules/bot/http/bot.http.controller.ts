import type { Request, Response } from 'express'
import { LINKING_CODE_PURPOSE } from '../../linking-codes/linking-code.constants.js'
import type { BotService } from '../bot.service.js'

export class BotHttpController {
  constructor(private readonly botService: BotService) {}

  async createLinkingCode(req: Request, res: Response) {
    const userId = req.auth.userId
    const generatedLinkingCode = await this.botService.createLinkingCode({
      userId,
      purpose: LINKING_CODE_PURPOSE.BOT_LINK,
    })
    res.status(201).json(generatedLinkingCode)
  }
}
