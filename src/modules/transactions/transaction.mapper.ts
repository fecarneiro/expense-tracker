import { transactionResponseSchema } from './transaction.schemas.js'
import type { TransactionWithCategory } from './transaction.types.js'

export type TransactionResponse = ReturnType<typeof toTransactionResponse>

export const toTransactionResponse = (transaction: TransactionWithCategory) => {
  const { userId, createdByUserId, createdAt, categoryId, category, occurredAt, ...fields } =
    transaction

  return transactionResponseSchema.parse({
    ...fields,
    occurredAt: occurredAt.toISOString(),
    category,
  })
}
