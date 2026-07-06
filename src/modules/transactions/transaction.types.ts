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

export type MonthlyBalanceRange = {
  from?: Date | undefined
  until?: Date | undefined
}
export type FindMonthlyTotalsInRangeInput = {
  userId: string
  range?: MonthlyBalanceRange | undefined
}
export type FindMonthlyTotalsInRangeRepositoryInput = {
  userId: string
  timeZone: string
  from?: Date | undefined
  until?: Date | undefined
}
export type MonthlyTotalsRow = {
  month: string
  incomeTotal: number
  expenseTotal: number
}

export type MonthlyTotalsInRangeRow = MonthlyTotalsRow & {
  balance: number
}
