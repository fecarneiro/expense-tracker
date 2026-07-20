import { categoryNameField } from '../../../categories/category.schemas.js'
import type { TransactionAmountCents, TransactionType } from '../../transaction.types.js'
import { transactionAmountParser } from './transaction-amount.parser.js'

export type FastTransaction = {
  transactionType: TransactionType
  amountCents: TransactionAmountCents
  categoryName: string
}

/**
 * Matches a fast transaction message in the format `"<amount> <category>"`.
 * The amount may start with `+` or `-` and may use `.` or `,` for decimals.
 */
export const FAST_TRANSACTION_PATTERN = /^(?<amount>[+-]?\d+(?:[.,]\d+)?)\s+(?<categoryName>.+)$/

export function fastTransactionParser(message: string): FastTransaction | null {
  const match = message.trim().match(FAST_TRANSACTION_PATTERN)
  if (!match?.groups) return null

  const amountPart = match.groups.amount
  const rawCategoryName = match.groups.categoryName

  if (!amountPart || !rawCategoryName) return null

  const transactionType = amountPart.startsWith('+') ? 'income' : 'expense'

  const amountCents = transactionAmountParser(amountPart)
  if (amountCents == null) return null

  const categoryResult = categoryNameField.safeParse(rawCategoryName)

  if (!categoryResult.success) return null

  return {
    transactionType,
    amountCents,
    categoryName: categoryResult.data,
  }
}
