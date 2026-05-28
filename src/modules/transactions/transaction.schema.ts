import * as z from 'zod'
import type { Transaction } from './transaction.entity.js'

const transactionBaseSchema = z.object({
  categoryId: z.uuid(),
  type: z.enum(['income', 'expense']),
  amountInCents: z.number().int().positive(),
  description: z.string().trim().min(1).max(70),
})

// HTTP schemas
export const transactionIdParamsSchema = z.object({ id: z.uuid() })
export const createTransactionSchema = transactionBaseSchema
export const updateTransactionSchema = transactionBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0)

// Application inputs
export type CreateTransactionInput = z.infer<typeof createTransactionSchema> &
  Pick<Transaction, 'userId'>

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema> &
  Pick<Transaction, 'id' | 'userId'>
export type FindTransactionByIdInput = Pick<Transaction, 'id' | 'userId'>
export type FindAllTransactionsInput = Pick<Transaction, 'userId'>
export type DeleteTransactionInput = Pick<Transaction, 'id' | 'userId'>
