import type { Telegram } from '../../database/schemas/telegram.schema.js'
import type { AuthService } from '../auth/auth.service.js'
import type { GetUserIdByTelegramIdData, LinkTelegramAccountData } from './telegram.dto.js'
import { TelegramLinkAccountFailedError } from './telegram.error.js'
import type { TelegramRepository } from './telegram.repository.js'

export class TelegramService {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramRepository: TelegramRepository,
  ) {}

  async linkAccount(data: LinkTelegramAccountData): Promise<Telegram> {
    const { email, password, telegramId } = data

    const verifiedAccount = await this.authService.login({
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

  async getUserIdByTelegramId(
    data: GetUserIdByTelegramIdData,
  ): Promise<Pick<Telegram, 'userId'> | null> {
    return await this.telegramRepository.findUserIdByTelegramId(data)
  }
}
