import type { LinkingCodeService } from '../linking-codes/linking-code.service.js'
import type { CreateLinkingCodeBodyInput } from '../linking-codes/linking-code.types.js'
import { BotLinkAccountFailedError } from './bot.error.js'
import { type GeneratedLinkingCodeResponse, toGeneratedLinkingCodeResponse } from './bot.mapper.js'
import type { BotRepository } from './bot.repository.js'
import type {
  BotAccount,
  FindAccountByTelegramIdInput,
  VerifyAndLinkAccountInput,
} from './bot.types.js'

export class BotService {
  constructor(
    private readonly botRepository: BotRepository,
    private readonly linkingCodeService: LinkingCodeService,
  ) {}

  async findAccountByTelegramId(data: FindAccountByTelegramIdInput): Promise<BotAccount | null> {
    return await this.botRepository.findAccountByTelegramId(data)
  }

  async createLinkingCode(data: CreateLinkingCodeBodyInput): Promise<GeneratedLinkingCodeResponse> {
    const generatedLinkingCode = await this.linkingCodeService.create(data)
    return toGeneratedLinkingCodeResponse(generatedLinkingCode)
  }

  async verifyAndLinkAccount(data: VerifyAndLinkAccountInput): Promise<void> {
    const { telegramId, code } = data
    const { userId } = await this.linkingCodeService.verify({ telegramId, code })
    const linked = await this.botRepository.linkAccount({ userId, telegramId })

    if (!linked) throw new BotLinkAccountFailedError()

    await this.linkingCodeService.deleteByUserId({ userId })
  }
}
