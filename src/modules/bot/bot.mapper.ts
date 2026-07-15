import type { z } from 'zod'
import { generatedLinkingCodeResponseSchema } from '../linking-codes/linking-code.schemas.js'
import type { GeneratedLinkingCode } from '../linking-codes/linking-code.types.js'

export type GeneratedLinkingCodeResponse = z.infer<typeof generatedLinkingCodeResponseSchema>

export function toGeneratedLinkingCodeResponse(
  linkingCode: GeneratedLinkingCode,
): GeneratedLinkingCodeResponse {
  return generatedLinkingCodeResponseSchema.parse({
    code: linkingCode.code,
    createdAt: linkingCode.createdAt.toISOString(),
  })
}
