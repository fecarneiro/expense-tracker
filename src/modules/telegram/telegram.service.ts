import type { PublicTelegram } from '../../database/schemas/telegram.schema.js'
import type { AuthService } from '../auth/auth.service.js'
import type { TelegramLinkAccountInput } from './telegram.dto.js'
import { TelegramLinkAccountFailedError } from './telegram.error.js'
import type { TelegramRepository } from './telegram.repository.js'

export class TelegramService {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramRepository: TelegramRepository,
  ) {}

  async linkAccount(data: TelegramLinkAccountInput): Promise<PublicTelegram> {
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
}
