import * as z from 'zod'
import { yearMonthSchema } from '../../../utils/date.utils.js'

export const monthlyBalanceQuerySchema = z
  .strictObject({
    startMonth: yearMonthSchema.optional(),
    endMonth: yearMonthSchema.optional(),
  })
  .meta({
    id: 'MonthlyBalanceQuery',
  })

export const monthlyBalanceItemHttpResponseSchema = z
  .object({
    month: yearMonthSchema.meta({
      example: '2026-06',
    }),
    incomeTotal: z.number().int().meta({
      description: 'Total income in cents.',
      example: 0,
    }),
    expenseTotal: z.number().int().meta({
      description: 'Total expense in cents.',
      example: 6000,
    }),
    balance: z.number().int().meta({
      description: 'Balance in cents (incomeTotal - expenseTotal).',
      example: -6000,
    }),
  })
  .meta({
    id: 'MonthlyBalanceItem',
  })

export const monthlyBalanceHttpResponseSchema = z.array(monthlyBalanceItemHttpResponseSchema).meta({
  id: 'MonthlyBalanceList',
})
