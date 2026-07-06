import { z } from 'zod'
import { categoryIdField, categoryNameField } from '../categories/http/category.http.dto.js'
import { LIST_DEFAULT_LIMIT, LIST_DEFAULT_OFFSET } from './transaction.constants.js'

export const transactionIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const transactionAmountInCentsField = z.number().int().positive().meta({
  example: 10000,
})

export const transactionAmountInCentsNonNegativeField = z.number().int().nonnegative().meta({
  example: 10000,
})

export const transactionTypeField = z.enum(['income', 'expense']).meta({
  example: 'expense',
})

export const transactionNotesField = z
  .string()
  .trim()
  .max(70)
  .optional()
  .transform((val) => (val == null || val === '' ? null : val))

export const transactionQueryParamsSchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(LIST_DEFAULT_LIMIT),
  offset: z.coerce.number().int().min(0).default(LIST_DEFAULT_OFFSET),
})

// REQUEST
export const occurredAtQueryField = z.iso.datetime({ offset: true }).meta({
  example: '2026-01-01T00:00:00+00:00',
})

export const occurredAtRequestField = occurredAtQueryField.transform((value) => new Date(value))

const transactionsByRangeQueryBaseSchema = z
  .strictObject({
    from: occurredAtQueryField.optional().meta({
      description: 'Lower bound (inclusive). Omit for no start limit.',
    }),
    until: occurredAtQueryField.optional().meta({
      description: 'Upper bound (exclusive). Omit for no end limit.',
    }),
  })
  .refine((data) => data.from == null || data.until == null || data.from < data.until, {
    message: 'from must be before until',
  })

export const transactionsByRangeQueryOpenApiSchema = transactionsByRangeQueryBaseSchema.meta({
  id: 'TransactionsByRangeQuery',
  description: 'Optional date range filter. Omit both to aggregate all transactions.',
})

export const transactionsByRangeQuerySchema = transactionsByRangeQueryBaseSchema.transform(
  ({ from, until }) => ({
    from: from ? new Date(from) : undefined,
    until: until ? new Date(until) : undefined,
  }),
)

const transactionBodyFields = {
  occurredAt: occurredAtRequestField,
  categoryId: categoryIdField,
  amountInCents: transactionAmountInCentsField,
  notes: transactionNotesField,
}

export const transactionIdParamsSchema = z.strictObject({
  id: transactionIdField,
})

export const createTransactionBodySchema = z
  .strictObject(transactionBodyFields)
  .meta({ id: 'CreateTransactionBody' })

export const updateTransactionBodySchema = z
  .strictObject(transactionBodyFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Inform at least 1 field to update',
  })
  .meta({ id: 'UpdateTransactionBody' })

// RESPONSE
export const occurredAtResponseField = z.iso.datetime({ offset: true })

export const transactionNotesResponseField = z.string().max(70).nullable()

export const transactionCategoryResponseSchema = z
  .object({
    id: categoryIdField,
    name: categoryNameField,
  })
  .meta({ id: 'TransactionCategory' })

export const transactionResponseSchema = z
  .object({
    id: transactionIdField,
    occurredAt: occurredAtResponseField,
    transactionType: transactionTypeField,
    amountInCents: transactionAmountInCentsField,
    notes: transactionNotesResponseField,
    category: transactionCategoryResponseSchema,
  })
  .meta({ id: 'Transaction' })

export const transactionsResponseSchema = z
  .array(transactionResponseSchema)
  .meta({ id: 'TransactionList' })

export const monthlyBalanceMonthField = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
  .meta({ example: '2026-03' })

export const monthlyBalanceRowSchema = z
  .object({
    month: monthlyBalanceMonthField,
    incomeTotal: transactionAmountInCentsNonNegativeField,
    expenseTotal: transactionAmountInCentsNonNegativeField,
    balance: z.number().int().meta({ example: 180000 }),
  })
  .meta({ id: 'MonthlyBalanceRow' })

export const monthlyBalanceResponseSchema = z
  .array(monthlyBalanceRowSchema)
  .meta({ id: 'MonthlyBalanceList' })
