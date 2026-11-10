import { type TransactionResponse, transactionResponseSchema } from '@expense-tracker/contracts'
import type { TransactionWithCategory } from './transaction.types.js'

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
