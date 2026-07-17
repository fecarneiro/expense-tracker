import type { z } from 'zod'
import { transactionResponseSchema } from './transaction.schemas.js'
import type { TransactionWithCategory } from './transaction.types.js'

export type TransactionResponse = z.infer<typeof transactionResponseSchema>

export const toTransactionResponse = (
  transaction: TransactionWithCategory,
): TransactionResponse => {
  const { userId, createdByUserId, createdAt, categoryId, category, occurredAt, ...fields } =
    transaction

  return transactionResponseSchema.parse({
    ...fields,
    occurredAt: occurredAt.toISOString(),
    category,
  })
}
