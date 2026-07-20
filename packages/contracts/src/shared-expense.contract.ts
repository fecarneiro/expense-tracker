import { z } from 'zod'

export const sharedExpenseStatusSchema = z.enum(['pending', 'settled'])
export type SharedExpenseStatus = z.infer<typeof sharedExpenseStatusSchema>

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

export const sharedExpenseReportMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
})

export const sharedExpenseReportResponseSchema = z.object({
  data: z.array(sharedExpenseReportItemSchema),
  meta: sharedExpenseReportMetaSchema,
})

export type SharedExpenseReportItem = z.infer<typeof sharedExpenseReportItemSchema>

export type SharedExpenseReportResponse = z.infer<typeof sharedExpenseReportResponseSchema>
