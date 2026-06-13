import * as z from 'zod'
import type { Transaction } from '../../database/schemas/transaction.schema.js'

const transactionNotesFieldField = z
  .string()
  .trim()
  .max(70)
  .optional()
  .transform((val) => (val == null || val === '' ? null : val))

export const transactionAmountInCentsField = z.number().int().positive()

export const transactionTypeField = z.enum(['income', 'expense'])

const transactionBaseSchema = z.object({
  occurredOn: z.iso.date(),
  categoryId: z.uuid(),
  transactionType: transactionTypeField,
  amountInCents: transactionAmountInCentsField,
  notes: transactionNotesFieldField,
})

// HTTP schemas
export const transactionIdParamsSchema = z.object({ id: z.uuid() })

export const transactionQueryParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const createTransactionSchema = transactionBaseSchema

export const updateTransactionSchema = transactionBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Inform at least 1 field to update',
  })

export type TransactionType = z.infer<typeof transactionTypeField>
export type TransactionAmountInCents = z.infer<typeof transactionAmountInCentsField>

// Application inputs
export type CreateTransactionInput = z.infer<typeof createTransactionSchema> &
  Pick<Transaction, 'userId'>

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema> &
  Pick<Transaction, 'id' | 'userId'>

export type FindTransactionByIdInput = Pick<Transaction, 'id' | 'userId'>

export type FindAllTransactionsInput = Pick<Transaction, 'userId'> & {
  limit?: number
  offset?: number
}

export type DeleteTransactionInput = Pick<Transaction, 'id' | 'userId'>
