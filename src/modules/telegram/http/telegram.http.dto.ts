import * as z from 'zod'

export const linkingCodeField = z.number().int().min(100_000).max(999_999).meta({
  example: 123456,
})

export const generatedLinkingCodeHttpResponseSchema = z
  .object({
    code: linkingCodeField,
    createdAt: z.date(),
  })
  .meta({
    id: 'GeneratedTelegramLinkingCode',
  })
