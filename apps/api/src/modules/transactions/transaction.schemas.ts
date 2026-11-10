import {
  categoryIdSchema,
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  transactionAmountCentsSchema,
} from '@expense-tracker/contracts'
import { z } from 'zod'
import { paginationQueryFields } from '../../shared/pagination.js'

// REQUEST
const occurredAtField = z.iso.datetime({ offset: true })

const rangeQueryFields = {
  from: occurredAtField.optional(),
  until: occurredAtField.optional(),
}

function toRange<T extends { from?: string | undefined; until?: string | undefined }>(query: T) {
  return {
    ...query,
    from: query.from ? new Date(query.from) : undefined,
    until: query.until ? new Date(query.until) : undefined,
  }
}

export const transactionQueryParamsSchema = z
  .strictObject({
    ...paginationQueryFields,
    ...rangeQueryFields,
  })
  .transform(toRange)

const transactionsByRangeQueryFieldsSchema = z.strictObject(rangeQueryFields)

export const transactionsByRangeQuerySchema =
  transactionsByRangeQueryFieldsSchema.transform(toRange)

export const transactionIdParamsSchema = z.strictObject({
  id: z.uuid(),
})

const transactionBodyFields = {
  occurredAt: occurredAtField.transform((value) => new Date(value)),
  categoryId: categoryIdSchema,
  amountCents: transactionAmountCentsSchema,
  description: z
    .string()
    .trim()
    .max(TRANSACTION_DESCRIPTION_MAX_LENGTH)
    .optional()
    .transform((val) => (val == null || val === '' ? null : val)),
}

export const createTransactionBodySchema = z.strictObject(transactionBodyFields)

export const updateTransactionBodySchema = z
  .strictObject(transactionBodyFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Inform at least 1 field to update',
  })

export type CreateTransactionBodyInput = z.input<typeof createTransactionBodySchema>
export type TransactionQueryInput = z.input<typeof transactionQueryParamsSchema>
export type MonthlyBalanceQueryInput = z.input<typeof transactionsByRangeQueryFieldsSchema>
