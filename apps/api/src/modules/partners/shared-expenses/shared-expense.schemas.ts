import { sharedExpenseStatusSchema } from '@expense-tracker/contracts'
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

export const createSharedExpensesBodySchema = z.object({
  expenses: z.array(createSharedExpenseBodySchema).min(1).max(20),
})

export const sharedExpenseReportQuerySchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  status: sharedExpenseStatusSchema.optional(),
  payerUserId: z.uuid().optional(),
  owedUserId: z.uuid().optional(),
})
