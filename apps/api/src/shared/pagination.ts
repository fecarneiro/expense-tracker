import { z } from 'zod'

export const LIST_DEFAULT_LIMIT = 10
export const LIST_DEFAULT_OFFSET = 0

export const paginationQueryFields = {
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
}
