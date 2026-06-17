import { randomInt } from 'node:crypto'
import type { Telegram } from '../../database/schemas/telegram.schema.js'
import type { AuthService } from '../auth/auth.service.js'
import type {
  CreateUniqueTelegramCodeInput,
  GetUserIdByTelegramIdData,
  LinkTelegramAccountData,
} from './telegram.dto.js'
import {
  TelegramGenerateCodeFailedError,
  TelegramLinkAccountFailedError,
} from './telegram.error.js'
import type { TelegramRepository } from './telegram.repository.js'
import type { GeneratedLinkingCode } from './telegram.types.js'

export class TelegramService {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramRepository: TelegramRepository,
  ) {}

  async linkAccount(data: LinkTelegramAccountData): Promise<Telegram> {
    const { email, password, telegramId } = data

    const verifiedAccount = await this.authService.verifyCredentials({
      email,
      password,
    })

    const { id: userId } = verifiedAccount

    const telegramAccount = await this.telegramRepository.linkAccount({
      userId,
      telegramId,
    })

    if (!telegramAccount) throw new TelegramLinkAccountFailedError()

    return telegramAccount
  }

  async createUniqueTelegramLinkingCode(
    data: CreateUniqueTelegramCodeInput,
  ): Promise<GeneratedLinkingCode> {
    const { email, password } = data

    const verifiedAccount = await this.authService.verifyCredentials({
      email,
      password,
    })

    for (let attempt = 1; attempt <= 5; attempt++) {
      const { id: userId } = verifiedAccount

      const code = randomInt(100_000, 1_000_000)
      const result = await this.telegramRepository.saveLinkingCode({ userId, code })

      if (!result.saved) {
        continue
      }

      return result.generatedLinkingCode
    }
    throw new TelegramGenerateCodeFailedError()
  }

  async getUserIdByTelegramId(
    data: GetUserIdByTelegramIdData,
  ): Promise<Pick<Telegram, 'userId'> | null> {
    return await this.telegramRepository.findUserIdByTelegramId(data)
  }
}
