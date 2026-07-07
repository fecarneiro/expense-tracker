import type { z } from 'zod'
import { generatedLinkingCodeResponseSchema } from './bot.schemas.js'
import type { GeneratedLinkingCode } from './linking-code/linking-code.types.js'

export type GeneratedLinkingCodeResponse = z.infer<typeof generatedLinkingCodeResponseSchema>

export function toGeneratedLinkingCodeResponse(
  linkingCode: GeneratedLinkingCode,
): GeneratedLinkingCodeResponse {
  return generatedLinkingCodeResponseSchema.parse({
    code: linkingCode.code,
    createdAt: linkingCode.createdAt.toISOString(),
  })
}
