import * as z from 'zod'

const transactionBaseSchema = z.object({
  categoryId: z.uuid(),
  type: z.enum(['income', 'expense']),
  amountInCents: z.number().int().positive(),
  description: z.string().trim().min(1).max(255),
})

export const createTransactionSchema = transactionBaseSchema

export const transactionResponseSchema = transactionBaseSchema.extend({
  id: z.uuid(),
  userId: z.uuid(),
  createdAt: z.date(),
})

export const updateTransactionSchema = transactionBaseSchema.partial()

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>
export type TransactionDTO = z.infer<typeof transactionResponseSchema>
