import { z } from 'zod'

export const sharedExpensePersonSchema = z.object({
  id: z.uuid(),
  email: z.email(),
})

export const sharedExpenseCategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export const sharedExpenseReportItemSchema = z.object({
  id: z.uuid(),
  occurredAt: z.iso.datetime({ offset: true }),

  category: sharedExpenseCategorySchema,

  payer: sharedExpensePersonSchema,
  owed: sharedExpensePersonSchema,

  totalAmountCents: z.number().int(),
  owedAmountCents: z.number().int(),

  description: z.string().nullable(),
  status: z.enum(['pending', 'settled']),
})

export const sharedExpensesReportResponseSchema = z.object({
  items: z.array(sharedExpenseReportItemSchema),
})

export type SharedExpenseReportItem = z.infer<typeof sharedExpenseReportItemSchema>

export type SharedExpensesReportResponse = z.infer<typeof sharedExpensesReportResponseSchema>
