import { LINKING_CODE_PURPOSE } from '../linking-codes/linking-code.constants.js'
import type { LinkingCodeService } from '../linking-codes/linking-code.service.js'
import type { CreateLinkingCodeBodyInput } from '../linking-codes/linking-code.types.js'
import { BotLinkAccountFailedError } from './bot.error.js'
import { type GeneratedLinkingCodeResponse, toGeneratedLinkingCodeResponse } from './bot.mapper.js'
import type { BotRepository } from './bot.repository.js'
import type { BotAccount } from './bot.types.js'

export type VerifyAndLinkAccountInput = {
  telegramId: number
  code: number
}

export class BotService {
  constructor(
    private readonly botRepository: BotRepository,
    private readonly linkingCodeService: LinkingCodeService,
  ) {}

  async findAccountByTelegramId(telegramId: number): Promise<BotAccount | null> {
    return await this.botRepository.findAccountByTelegramId(telegramId)
  }

  async createLinkingCode(data: CreateLinkingCodeBodyInput): Promise<GeneratedLinkingCodeResponse> {
    const generatedLinkingCode = await this.linkingCodeService.create(data)
    return toGeneratedLinkingCodeResponse(generatedLinkingCode)
  }

  async verifyAndLinkAccount(data: VerifyAndLinkAccountInput): Promise<void> {
    const purpose = LINKING_CODE_PURPOSE.BOT_LINK
    const { userId } = await this.linkingCodeService.verify({
      code: data.code,
      purpose,
    })
    const linked = await this.botRepository.linkAccount({ userId, telegramId: data.telegramId })

    if (!linked) throw new BotLinkAccountFailedError()

    await this.linkingCodeService.delete({ userId, purpose })
  }
}
