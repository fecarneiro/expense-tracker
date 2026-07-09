import { randomInt } from 'node:crypto'
import { LINKING_CODE } from './linking-code.constants.js'
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

export class LinkingCodeService {
  constructor(private readonly linkingCodeRepository: LinkingCodeRepository) {}

  async create(data: CreateLinkingCodeBodyInput): Promise<GeneratedLinkingCode> {
    const userId = data.userId

    for (let attempt = 1; attempt <= LINKING_CODE.GENERATION_MAX_ATTEMPTS; attempt++) {
      const code = randomInt(LINKING_CODE.MIN_NUMBER, LINKING_CODE.MAX_NUMBER)
      const result = await this.linkingCodeRepository.saveLinkingCode({ userId, code })

      if (!result.saved) {
        continue
      }

      return result.generatedLinkingCode
    }
    throw new BotGenerateCodeFailedError()
  }

  async verify(data: VerifyLinkingCodeInput): Promise<{ userId: string }> {
    const linkingCode = await this.linkingCodeRepository.findByCode({ code: data.code })

    if (!linkingCode || this.isLinkingCodeExpired(linkingCode.createdAt)) {
      throw new InvalidOrExpiredLinkingCodeError()
    }

    return { userId: linkingCode.userId }
  }

  async deleteByUserId(data: DeleteLinkingCodeByUserIdInput): Promise<void> {
    await this.linkingCodeRepository.deleteByUserId(data)
  }

  private isLinkingCodeExpired(createdAt: Date): boolean {
    return Date.now() - createdAt.getTime() > LINKING_CODE.TTL_MS
  }
}
