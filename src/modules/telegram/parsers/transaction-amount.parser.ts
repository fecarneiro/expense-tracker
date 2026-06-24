import { transactionAmountInCentsField } from '../../transactions/transaction.dto.js'
import type { TransactionAmountInCents } from '../../transactions/transaction.types.js'

export function transactionAmountParser(message: string): TransactionAmountInCents | null {
  if (!message) return null

  const normalized = message.trim().replace(/^[+-]/, '').replace(',', '.')
  const numeric = Number(normalized)
  const cents = Math.round(numeric * 100)

  const result = transactionAmountInCentsField.safeParse(cents)

  return result.success ? result.data : null
}
