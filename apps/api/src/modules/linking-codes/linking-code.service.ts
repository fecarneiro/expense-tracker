import { randomInt } from 'node:crypto'
import { LINKING_CODE } from './linking-code.constants.js'
import {
  InvalidOrExpiredLinkingCodeError,
  LinkingCodeGenerationError,
} from './linking-code.error.js'
import type { LinkingCodeRepository } from './linking-code.repository.js'
import type {
  CreateLinkingCodeBodyInput,
  DeleteLinkingCode,
  GeneratedLinkingCode,
  VerifyLinkingCodeInput,
} from './linking-code.types.js'

export class LinkingCodeService {
  constructor(private readonly linkingCodeRepository: LinkingCodeRepository) {}

  async create(data: CreateLinkingCodeBodyInput): Promise<GeneratedLinkingCode> {
    for (let attempt = 1; attempt <= LINKING_CODE.GENERATION_MAX_ATTEMPTS; attempt++) {
      const code = randomInt(LINKING_CODE.MIN_NUMBER, LINKING_CODE.MAX_NUMBER)
      const result = await this.linkingCodeRepository.save({
        userId: data.userId,
        code,
        purpose: data.purpose,
      })

      if (!result.saved) {
        continue
      }

      return result.generatedLinkingCode
    }
    throw new LinkingCodeGenerationError()
  }

  async verify(data: VerifyLinkingCodeInput): Promise<{ userId: string }> {
    const linkingCode = await this.linkingCodeRepository.find({
      code: data.code,
      purpose: data.purpose,
    })

    if (!linkingCode || this.isLinkingCodeExpired(linkingCode.createdAt)) {
      throw new InvalidOrExpiredLinkingCodeError()
    }

    return { userId: linkingCode.userId }
  }

  async delete(data: DeleteLinkingCode): Promise<void> {
    await this.linkingCodeRepository.delete(data)
  }

  private isLinkingCodeExpired(createdAt: Date): boolean {
    return Date.now() - createdAt.getTime() > LINKING_CODE.TTL_MS
  }
}
