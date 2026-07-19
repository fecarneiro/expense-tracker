import { z } from 'zod'

export const sharedExpenseReportItemSchema = z.object({
  id: z.uuid(),
  occurredAt: z.iso.datetime({ offset: true }),

  categoryName: z.string(),

  payerUserId: z.uuid(),
  owedUserId: z.uuid(),

  totalAmountCents: z.number().int(),
  owedAmountCents: z.number().int(),

  description: z.string().nullable(),
  status: z.enum(['pending', 'settled']),
})

export const sharedExpenseReportResponseSchema = z.object({
  data: z.array(sharedExpenseReportItemSchema),
})

export type SharedExpenseReportItem = z.infer<typeof sharedExpenseReportItemSchema>

export type SharedExpenseReportResponse = z.infer<typeof sharedExpenseReportResponseSchema>
