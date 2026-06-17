import { randomInt } from 'node:crypto'
import type { Telegram } from '../../database/schemas/telegram.schema.js'
import type { AuthService } from '../auth/auth.service.js'
import type {
  GetUserIdByTelegramIdData,
  LinkTelegramAccountData,
} from './http/telegram.http.dto.js'
import {
  TelegramGenerateCodeFailedError,
  TelegramLinkAccountFailedError,
} from './telegram.error.js'
import type { TelegramRepository } from './telegram.repository.js'
import type { CreateLinkingCodeBodyInput, GeneratedLinkingCode } from './telegram.types.js'

export const MAX_ATTEMPTS = 5
export const MIN_CODE = 100_000
export const MAX_CODE = 1_000_000

export class TelegramService {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramRepository: TelegramRepository,
  ) {}

  async getUserIdByTelegramId(
    data: GetUserIdByTelegramIdData,
  ): Promise<Pick<Telegram, 'userId'> | null> {
    return await this.telegramRepository.findUserIdByTelegramId(data)
  }

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

  async createLinkingCode(data: CreateLinkingCodeBodyInput): Promise<GeneratedLinkingCode> {
    const userId = data.userId

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const code = randomInt(MIN_CODE, MAX_CODE)
      const result = await this.telegramRepository.saveLinkingCode({ userId, code })

      if (!result.saved) {
        continue
      }

      return result.generatedLinkingCode
    }
    throw new TelegramGenerateCodeFailedError()
  }
}
