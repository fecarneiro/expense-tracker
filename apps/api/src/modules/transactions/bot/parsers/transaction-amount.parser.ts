import { transactionAmountCentsSchema } from '@expense-tracker/contracts'
import type { TransactionAmountCents } from '../../transaction.types.js'

export function transactionAmountParser(message: string): TransactionAmountCents | null {
  if (!message) return null

  const normalized = message.trim().replace(/^[+-]/, '').replace(',', '.')
  const numeric = Number(normalized)
  const cents = Math.round(numeric * 100)

  const result = transactionAmountCentsSchema.safeParse(cents)

  return result.success ? result.data : null
}
