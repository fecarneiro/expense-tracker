import z from 'zod'
import { yearMonthSchema } from '../../utils/date.utils.js'
import type { Transaction } from '../transactions/transaction.types.js'

export const getMonthlyBalanceSchema = z.object({
  startMonth: yearMonthSchema.optional(),
  endMonth: yearMonthSchema.optional(),
})

export type GetMonthlyBalanceInput = z.infer<typeof getMonthlyBalanceSchema> &
  Pick<Transaction, 'userId'>

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
