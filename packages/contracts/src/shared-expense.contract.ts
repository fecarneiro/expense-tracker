import { z } from 'zod'
import { paginationMetaSchema } from './pagination.contract.js'
import { TRANSACTION_DESCRIPTION_MAX_LENGTH } from './transaction.contract.js'

export const sharedExpenseStatusSchema = z.enum(['pending', 'settled'])
export type SharedExpenseStatus = z.infer<typeof sharedExpenseStatusSchema>

export const SPLIT_TYPE = {
  HALF: 'half',
  FULL: 'full',
} as const

export type SplitType = (typeof SPLIT_TYPE)[keyof typeof SPLIT_TYPE]

export const SHARED_EXPENSES_BATCH_MAX = 20

export function resolveSplitAmounts(totalAmountCents: number, split: SplitType) {
  if (split === SPLIT_TYPE.FULL) {
    return { payerAmountCents: 0, owedAmountCents: totalAmountCents }
  }

  const owedAmountCents = Math.floor(totalAmountCents / 2)

  return {
    payerAmountCents: totalAmountCents - owedAmountCents,
    owedAmountCents,
  }
}

export const createSharedExpenseRequestSchema = z.object({
  totalAmountCents: z.number().int().positive(),
  sharedCategoryId: z.uuid(),
  split: z.enum([SPLIT_TYPE.HALF, SPLIT_TYPE.FULL]),
  description: z
    .string()
    .trim()
    .max(TRANSACTION_DESCRIPTION_MAX_LENGTH)
    .optional()
    .transform((val) => (val == null || val === '' ? null : val)),
})

export const createSharedExpensesRequestSchema = z.object({
  expenses: z.array(createSharedExpenseRequestSchema).min(1).max(SHARED_EXPENSES_BATCH_MAX),
})

export type CreateSharedExpenseRequest = z.input<typeof createSharedExpenseRequestSchema>

export const sharedExpenseReportItemSchema = z.object({
  id: z.uuid(),
  occurredAt: z.iso.datetime({ offset: true }),

  categoryName: z.string(),

  payerUserId: z.uuid(),
  owedUserId: z.uuid(),

  totalAmountCents: z.number().int(),
  owedAmountCents: z.number().int(),

  description: z.string().nullable(),
  status: sharedExpenseStatusSchema,
})

export const sharedExpenseReportResponseSchema = z.object({
  data: z.array(sharedExpenseReportItemSchema),
  meta: paginationMetaSchema,
})

export type SharedExpenseReportItem = z.infer<typeof sharedExpenseReportItemSchema>

export type SharedExpenseReportResponse = z.infer<typeof sharedExpenseReportResponseSchema>
