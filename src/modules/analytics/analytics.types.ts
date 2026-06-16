import type { Transaction } from '../transactions/transaction.types.js'

export type GetMonthlyBalanceInput = {
  userId: string
  startMonth?: string | undefined
  endMonth?: string | undefined
}

export type GetMonthlyBalanceQuery = Pick<Transaction, 'userId'> & {
  fromDate: string
  untilDate: string
}

export type GetMonthlyBalanceOutput = {
  month: string
  incomeTotal: number
  expenseTotal: number
  balance: number
}

export type GetMonthlyBalanceOutputQuery = Omit<GetMonthlyBalanceOutput, 'balance'>
