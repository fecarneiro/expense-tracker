import { z } from 'zod'
import { SPLIT_TYPE } from './shared-expense.types.js'

export const createSharedExpenseBodySchema = z.object({
  totalAmountCents: z.number().int().positive(),
  sharedCategoryId: z.uuid(),
  split: z.enum([SPLIT_TYPE.HALF, SPLIT_TYPE.FULL]),
  description: z
    .string()
    .trim()
    .max(70)
    .optional()
    .transform((val) => (val == null || val === '' ? null : val)),
})
