import type { AuthService } from '../auth/auth.service.js'
import type { LinkingCodeService } from './linking-code/linking-code.service.js'
import type {
  CreateLinkingCodeBodyInput,
  GeneratedLinkingCode,
} from './linking-code/linking-code.types.js'
import { TelegramLinkAccountFailedError } from './telegram.error.js'
import type { TelegramRepository } from './telegram.repository.js'
import type {
  FindAccountByTelegramIdInput,
  LinkTelegramAccountInput,
  TelegramAccount,
  VerifyAndLinkAccountInput,
} from './telegram.types.js'

export class TelegramService {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramRepository: TelegramRepository,
    private readonly linkingCodeService: LinkingCodeService,
  ) {}

  async findAccountByTelegramId(
    data: FindAccountByTelegramIdInput,
  ): Promise<TelegramAccount | null> {
    return await this.telegramRepository.findAccountByTelegramId(data)
  }

  async linkAccount(data: LinkTelegramAccountInput): Promise<TelegramAccount> {
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
    return this.linkingCodeService.create(data)
  }

  async verifyAndLinkAccount(data: VerifyAndLinkAccountInput): Promise<void> {
    const { telegramId, code } = data
    const { userId } = await this.linkingCodeService.verify({ telegramId, code })
    const linked = await this.telegramRepository.linkAccount({ userId, telegramId })

    if (!linked) throw new TelegramLinkAccountFailedError()

    await this.linkingCodeService.deleteByUserId({ userId })
  }
}
