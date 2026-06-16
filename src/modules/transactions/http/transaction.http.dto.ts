import * as z from 'zod'
import { categoryIdField, categoryNameField } from '../../categories/http/category.http.dto.js'

export const transactionIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const transactionAmountInCentsField = z.number().int().positive().meta({
  description: 'Amount in cents.',
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

const transactionBodyFields = {
  occurredOn: z.iso.date().meta({ example: '2026-06-03' }),
  categoryId: categoryIdField,
  transactionType: transactionTypeField,
  amountInCents: transactionAmountInCentsField,
  notes: transactionNotesField,
}

export const transactionIdParamsSchema = z.strictObject({
  id: transactionIdField,
})

export const transactionQueryParamsSchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const createTransactionBodySchema = z.strictObject(transactionBodyFields).meta({
  id: 'CreateTransactionBody',
})

export const updateTransactionBodySchema = z
  .strictObject(transactionBodyFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Inform at least 1 field to update',
  })
  .meta({
    id: 'UpdateTransactionBody',
  })

export const transactionCategoryHttpResponseSchema = z
  .object({
    id: categoryIdField,
    name: categoryNameField,
  })
  .meta({
    id: 'TransactionCategory',
  })

export const transactionHttpResponseSchema = z
  .object({
    id: transactionIdField,
    occurredOn: z.iso.date(),
    transactionType: transactionTypeField,
    amountInCents: transactionAmountInCentsField,
    notes: z.string().nullable(),
    createdAt: z.date(),
    category: transactionCategoryHttpResponseSchema,
  })
  .meta({
    id: 'Transaction',
  })

export const transactionsHttpResponseSchema = z.array(transactionHttpResponseSchema).meta({
  id: 'TransactionList',
})
