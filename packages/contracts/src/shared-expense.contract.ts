import { z } from 'zod'

export const sharedExpenseStatusSchema = z.enum(['pending', 'settled'])
export type SharedExpenseStatus = z.infer<typeof sharedExpenseStatusSchema>

export const sharedExpenseSplitSchema = z.enum(['half', 'full'])
export type SharedExpenseSplit = z.infer<typeof sharedExpenseSplitSchema>

export const sharedExpenseDescriptionSchema = z
  .string()
  .trim()
  .max(70)
  .optional()
  .nullable()
  .transform((val) => (val == null || val === '' ? null : val))

export const createSharedExpenseRequestSchema = z.object({
  totalAmountCents: z.number().int().positive(),
  sharedCategoryId: z.uuid(),
  description: sharedExpenseDescriptionSchema,
  split: sharedExpenseSplitSchema,
})

export type CreateSharedExpenseRequest = z.infer<typeof createSharedExpenseRequestSchema>

export const createSharedExpenseFormSchema = z.object({
  amount: z
    .union([z.number(), z.null()])
    .refine((value): value is number => value != null && Number.isFinite(value) && value > 0, {
      message: 'Enter an amount greater than zero.',
    }),
  sharedCategoryId: z.uuid('Choose a category.'),
  description: sharedExpenseDescriptionSchema,
  split: sharedExpenseSplitSchema,
})
export type CreateSharedExpenseFormValues = z.infer<typeof createSharedExpenseFormSchema>

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
