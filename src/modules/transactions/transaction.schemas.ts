import { z } from 'zod'
import { categoryIdField, categoryNameField } from '../categories/http/category.http.dto.js'
import { LIST_DEFAULT_LIMIT, LIST_DEFAULT_OFFSET } from './transaction.constants.js'

export const transactionIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const transactionAmountInCentsField = z.number().int().positive().meta({
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
export const occurredAtRequestField = z.iso
  .datetime({ offset: true })
  .transform((value) => new Date(value))
  .meta({ example: '2026-01-01T00:00:00+00:00' })

export const transactionsByRangeQuerySchema = z
  .strictObject({
    from: occurredAtRequestField,
    until: occurredAtRequestField,
  })
  .refine((data) => data.from < data.until, {
    message: 'from must be before until',
  })
  .meta({ id: 'TransactionsByRangeQuery' })

const transactionBodyFields = {
  occurredAt: occurredAtRequestField,
  categoryId: categoryIdField,
  amountInCents: transactionAmountInCentsField,
  notes: transactionNotesField,
}

export const transactionIdParamsSchema = z.strictObject({
  id: transactionIdField,
  from: occurredAtRequestField,
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
