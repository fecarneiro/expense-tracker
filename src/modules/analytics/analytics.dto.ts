import type { Transaction } from '../../database/schemas/transaction.schema.js'

export type GetMonthlyBalanceInput = Pick<Transaction, 'userId'>

export type GetMonthlyBalanceOutput = {
  month: string
  total: number
}
