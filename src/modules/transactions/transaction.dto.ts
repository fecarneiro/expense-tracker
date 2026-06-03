import * as z from 'zod'
import type { Transaction } from '../../database/schemas/transaction.schema.js'

const transactionNotesFieldSchema = z
  .string()
  .trim()
  .max(70)
  .optional()
  .transform((val) => (val == null || val === '' ? null : val))

const transactionBaseSchema = z.object({
  occurredOn: z.iso.date(),
  categoryId: z.uuid(),
  type: z.enum(['income', 'expense']),
  amountInCents: z.number().int().positive(),
  notes: transactionNotesFieldSchema,
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

// Application inputs
export type CreateTransactionInput = z.infer<typeof createTransactionSchema> &
  Pick<Transaction, 'userId'>

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema> &
  Pick<Transaction, 'id' | 'userId'>

export type FindTransactionByIdInput = Pick<Transaction, 'id' | 'userId'>

export type FindAllTransactionsInput = z.infer<
  typeof transactionQueryParamsSchema
> &
  Pick<Transaction, 'userId'>

export type DeleteTransactionInput = Pick<Transaction, 'id' | 'userId'>
