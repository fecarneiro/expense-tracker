import type { TransactionRow } from '../../database/schemas/transactions.schema.js'
import type { Category } from '../categories/category.types.js'

export type Transaction = TransactionRow

export type TransactionType = Transaction['transactionType']
export type TransactionAmountCents = Transaction['amountCents']

export type CreateTransactionInput = Omit<
  Transaction,
  'id' | 'transactionType' | 'createdByUserId' | 'createdAt'
> & {
  description?: Transaction['description']
  createdByUserId?: Transaction['createdByUserId']
}

export type UpdateTransactionInput = Pick<Transaction, 'id' | 'userId'> & {
  amountCents?: Transaction['amountCents'] | undefined
  description?: Transaction['description'] | undefined
  categoryId?: Transaction['categoryId'] | undefined
  transactionType?: Transaction['transactionType'] | undefined
  occurredAt?: Transaction['occurredAt'] | undefined
}

export type TransactionCategorySummary = Pick<Category, 'id' | 'name'>

export type TransactionWithCategory = TransactionRow & {
  category: TransactionCategorySummary
}

export type FindTransactionByIdInput = Pick<Transaction, 'id' | 'userId'>

export type TransactionRange = {
  from?: Date | undefined
  until?: Date | undefined
}

export type FindManyTransactionsInput = Pick<Transaction, 'userId'> &
  TransactionRange & {
    limit?: number | undefined
    offset?: number | undefined
  }

export type FindManyTransactionsRepositoryInput = Pick<Transaction, 'userId'> &
  TransactionRange & {
    limit: number
    offset: number
  }

export type FindExpenseCategoryTotalsInput = Pick<Transaction, 'userId'> & TransactionRange

export type DeleteTransactionInput = Pick<Transaction, 'id' | 'userId'>

export type FindMonthlyTotalsInRangeInput = {
  userId: string
  range?: TransactionRange | undefined
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
