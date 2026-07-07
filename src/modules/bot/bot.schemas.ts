import * as z from 'zod'

export const linkingCodeField = z.number().int().min(100_000).max(999_999).meta({
  example: 123456,
})

export const generatedLinkingCodeResponseSchema = z
  .object({
    code: linkingCodeField,
    createdAt: z.iso.datetime(),
  })
  .meta({
    id: 'GeneratedBotLinkingCode',
  })
