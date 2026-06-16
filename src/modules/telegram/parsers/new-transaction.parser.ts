import { transactionAmountInCentsField } from '../../transactions/http/transaction.http.dto.js'
import type { TransactionAmountInCents } from '../../transactions/transaction.types.js'

export function newTransactionParser(message: string): TransactionAmountInCents | null {
  if (!message) return null

  const normalized = message.trim().replace(',', '.')
  const numeric = Number(normalized)
  const cents = Math.round(numeric * 100)

  const result = transactionAmountInCentsField.safeParse(cents)

  return result.success ? result.data : null
}
