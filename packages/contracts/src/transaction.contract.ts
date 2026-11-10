import { z } from 'zod'
import { categoryIdSchema, categoryNameSchema, categoryTypeSchema } from './category.contract.js'
import { paginationMetaSchema } from './pagination.contract.js'

export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 70

export const transactionAmountCentsSchema = z.number().int().positive()

export const transactionResponseSchema = z.object({
  id: z.uuid(),
  occurredAt: z.iso.datetime({ offset: true }),
  transactionType: categoryTypeSchema,
  amountCents: transactionAmountCentsSchema,
  description: z.string().max(TRANSACTION_DESCRIPTION_MAX_LENGTH).nullable(),
  category: z.object({
    id: categoryIdSchema,
    name: categoryNameSchema,
  }),
})

export const transactionsResponseSchema = z.object({
  data: z.array(transactionResponseSchema),
  meta: paginationMetaSchema,
})

export const monthlyBalanceRowSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  incomeTotal: z.number().int().nonnegative(),
  expenseTotal: z.number().int().nonnegative(),
  balance: z.number().int(),
})

export const monthlyBalanceResponseSchema = z.array(monthlyBalanceRowSchema)

export const expenseCategoryTotalSchema = z.object({
  categoryId: categoryIdSchema,
  categoryName: categoryNameSchema,
  totalCents: transactionAmountCentsSchema,
})

export const expenseCategoryTotalsResponseSchema = z.array(expenseCategoryTotalSchema)

export type TransactionResponse = z.infer<typeof transactionResponseSchema>
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>
export type MonthlyBalanceRow = z.infer<typeof monthlyBalanceRowSchema>
export type ExpenseCategoryTotal = z.infer<typeof expenseCategoryTotalSchema>
