import { z } from 'zod'

export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>
