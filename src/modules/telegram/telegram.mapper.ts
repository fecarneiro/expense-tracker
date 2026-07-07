import type { z } from 'zod'
import type { GeneratedLinkingCode } from './linking-code/linking-code.types.js'
import { generatedLinkingCodeResponseSchema } from './telegram.schemas.js'

export type GeneratedLinkingCodeResponse = z.infer<typeof generatedLinkingCodeResponseSchema>

export function toGeneratedLinkingCodeResponse(
  linkingCode: GeneratedLinkingCode,
): GeneratedLinkingCodeResponse {
  return generatedLinkingCodeResponseSchema.parse({
    code: linkingCode.code,
    createdAt: linkingCode.createdAt.toISOString(),
  })
}
