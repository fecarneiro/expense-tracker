import * as z from 'zod'

export const linkingCodeField = z.number().int().min(100_000).max(999_999)

export const generatedLinkingCodeResponseSchema = z.object({
  code: linkingCodeField,
  createdAt: z.iso.datetime(),
})

export function linkingCodeParser(message: string) {
  const numeric = Number(message)
  const result = linkingCodeField.safeParse(numeric)

  return result.success ? result.data : null
}
