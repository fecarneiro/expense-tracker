import { randomInt } from 'node:crypto'
import {
  BotGenerateCodeFailedError,
  InvalidOrExpiredLinkingCodeError,
} from './linking-code.error.js'
import type { LinkingCodeRepository } from './linking-code.repository.js'
import type {
  CreateLinkingCodeBodyInput,
  DeleteLinkingCodeByUserIdInput,
  GeneratedLinkingCode,
  VerifyLinkingCodeInput,
} from './linking-code.types.js'
import type { LinkingCodeRateLimiter } from './linking-code-rate-limiter.js'

export const LINKING_CODE_GENERATION_MAX_ATTEMPTS = 5
export const LINKING_CODE_MIN_NUMBER = 100_000
export const LINKING_CODE_MAX_NUMBER = 1_000_000
export const LINKING_CODE_TTL_MS = 15 * 60 * 1000

export class LinkingCodeService {
  constructor(
    private readonly linkingCodeRepository: LinkingCodeRepository,
    private readonly linkingCodeRateLimiter: LinkingCodeRateLimiter,
  ) {}

  async create(data: CreateLinkingCodeBodyInput): Promise<GeneratedLinkingCode> {
    const userId = data.userId

    for (let attempt = 1; attempt <= LINKING_CODE_GENERATION_MAX_ATTEMPTS; attempt++) {
      const code = randomInt(LINKING_CODE_MIN_NUMBER, LINKING_CODE_MAX_NUMBER)
      const result = await this.linkingCodeRepository.saveLinkingCode({ userId, code })

      if (!result.saved) {
        continue
      }

      return result.generatedLinkingCode
    }
    throw new BotGenerateCodeFailedError()
  }

  async verify(data: VerifyLinkingCodeInput): Promise<{ userId: string }> {
    const { telegramId, code } = data

    this.linkingCodeRateLimiter.assertAllowed(telegramId)

    const linkingCode = await this.linkingCodeRepository.findByCode({ code })

    if (!linkingCode || this.isLinkingCodeExpired(linkingCode.createdAt)) {
      this.linkingCodeRateLimiter.recordFailure(telegramId)
      throw new InvalidOrExpiredLinkingCodeError()
    }

    this.linkingCodeRateLimiter.clear(telegramId)

    return { userId: linkingCode.userId }
  }

  async deleteByUserId(data: DeleteLinkingCodeByUserIdInput): Promise<void> {
    await this.linkingCodeRepository.deleteByUserId(data)
  }

  private isLinkingCodeExpired(createdAt: Date): boolean {
    return Date.now() - createdAt.getTime() > LINKING_CODE_TTL_MS
  }
}
