import type { TransactionRow } from '../../database/schemas/transaction.schema.js'
import type { Category } from '../categories/category.types.js'

export type Transaction = TransactionRow

export type TransactionType = Transaction['transactionType']
export type TransactionAmountInCents = Transaction['amountInCents']

export type CreateTransactionInput = Omit<
  Transaction,
  'id' | 'transactionType' | 'createdByUserId' | 'createdAt'
> & {
  notes?: Transaction['notes']
  createdByUserId?: Transaction['createdByUserId']
}

export type UpdateTransactionInput = Pick<Transaction, 'id' | 'userId'> & {
  amountInCents?: Transaction['amountInCents'] | undefined
  notes?: Transaction['notes'] | undefined
  categoryId?: Transaction['categoryId'] | undefined
  transactionType?: Transaction['transactionType'] | undefined
  occurredAt?: Transaction['occurredAt'] | undefined
}

export type TransactionCategorySummary = Pick<Category, 'id' | 'name'>

export type TransactionWithCategory = TransactionRow & {
  category: TransactionCategorySummary
}

export type FindTransactionByIdInput = Pick<Transaction, 'id' | 'userId'>

export type FindManyTransactionsInput = Pick<Transaction, 'userId'> & {
  limit: number
  offset: number
}

export type DeleteTransactionInput = Pick<Transaction, 'id' | 'userId'>

export type FindTransactionsByRangeInput = Pick<Transaction, 'userId'> & {
  from: Date
  until: Date
}

export type GetMonthlyBalanceInput = FindTransactionsByRangeInput
export type TransactionByRangeRow = Pick<
  Transaction,
  'occurredAt' | 'transactionType' | 'amountInCents'
>

export type MonthlyBalanceRow = {
  month: string
  incomeTotal: number
  expenseTotal: number
  balance: number
}
