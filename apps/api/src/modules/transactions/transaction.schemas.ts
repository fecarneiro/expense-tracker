import { z } from 'zod'
import { categoryIdField, categoryNameField } from '../categories/category.schemas.js'

export const transactionIdField = z.uuid()

export const transactionAmountCentsField = z.number().int().positive()

export const transactionAmountCentsNonNegativeField = z.number().int().nonnegative()

export const transactionTypeField = z.enum(['income', 'expense'])

export const transactionDescriptionField = z
  .string()
  .trim()
  .max(70)
  .optional()
  .transform((val) => (val == null || val === '' ? null : val))

export const transactionQueryParamsSchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

// REQUEST
export const occurredAtQueryField = z.iso.datetime({ offset: true })

export const occurredAtRequestField = occurredAtQueryField.transform((value) => new Date(value))

const transactionsByRangeQueryFieldsSchema = z.strictObject({
  from: occurredAtQueryField.optional(),
  until: occurredAtQueryField.optional(),
})

export const transactionsByRangeQuerySchema = transactionsByRangeQueryFieldsSchema.transform(
  ({ from, until }) => ({
    from: from ? new Date(from) : undefined,
    until: until ? new Date(until) : undefined,
  }),
)

const transactionBodyFields = {
  occurredAt: occurredAtRequestField,
  categoryId: categoryIdField,
  amountCents: transactionAmountCentsField,
  description: transactionDescriptionField,
}

export const transactionIdParamsSchema = z.strictObject({
  id: transactionIdField,
})

export const createTransactionBodySchema = z.strictObject(transactionBodyFields)

export const updateTransactionBodySchema = z
  .strictObject(transactionBodyFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Inform at least 1 field to update',
  })

// RESPONSE
export const occurredAtResponseField = z.iso.datetime({ offset: true })

export const transactionDescriptionResponseField = z.string().max(70).nullable()

export const transactionCategoryResponseSchema = z.object({
  id: categoryIdField,
  name: categoryNameField,
})

export const transactionResponseSchema = z.object({
  id: transactionIdField,
  occurredAt: occurredAtResponseField,
  transactionType: transactionTypeField,
  amountCents: transactionAmountCentsField,
  description: transactionDescriptionResponseField,
  category: transactionCategoryResponseSchema,
})

export const transactionsResponseSchema = z.array(transactionResponseSchema)

export const monthlyBalanceMonthField = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

export const monthlyBalanceRowSchema = z.object({
  month: monthlyBalanceMonthField,
  incomeTotal: transactionAmountCentsNonNegativeField,
  expenseTotal: transactionAmountCentsNonNegativeField,
  balance: z.number().int(),
})

export const monthlyBalanceResponseSchema = z.array(monthlyBalanceRowSchema)

export type CreateTransactionBodyInput = z.input<typeof createTransactionBodySchema>
export type UpdateTransactionBodyInput = z.input<typeof updateTransactionBodySchema>
export type TransactionQueryInput = z.input<typeof transactionQueryParamsSchema>
export type MonthlyBalanceQueryInput = z.input<typeof transactionsByRangeQueryFieldsSchema>
