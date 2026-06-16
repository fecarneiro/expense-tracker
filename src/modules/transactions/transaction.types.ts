export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  userId: string
  occurredOn: string
  categoryId: string
  transactionType: TransactionType
  amountInCents: number
  notes: string | null
  createdAt: Date
}

export type TransactionAmountInCents = Transaction['amountInCents']

export interface TransactionCategory {
  id: string
  name: string
}

export interface PublicTransactionWithCategory {
  id: string
  occurredOn: string
  transactionType: TransactionType
  amountInCents: number
  notes: string | null
  createdAt: Date
  category: TransactionCategory
}

export type CreateTransactionInput = {
  userId: string
  occurredOn: string
  categoryId: string
  transactionType: TransactionType
  amountInCents: number
  notes?: string | null
}

export type UpdateTransactionInput = {
  id: string
  userId: string
  occurredOn?: string | undefined
  categoryId?: string | undefined
  transactionType?: TransactionType | undefined
  amountInCents?: number | undefined
  notes?: string | null | undefined
}

export type FindTransactionByIdInput = Pick<Transaction, 'id' | 'userId'>
export type FindAllTransactionsInput = Pick<Transaction, 'userId'> & {
  limit?: number
  offset?: number
}
export type DeleteTransactionInput = Pick<Transaction, 'id' | 'userId'>
export type DeletedTransaction = Pick<Transaction, 'id'>
