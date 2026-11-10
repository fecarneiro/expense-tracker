import { sharedExpenseStatusSchema } from '@expense-tracker/contracts'
import { z } from 'zod'
import { paginationQueryFields } from '../../../shared/pagination.js'

export const sharedExpenseReportQuerySchema = z.strictObject({
  ...paginationQueryFields,
  status: sharedExpenseStatusSchema.optional(),
  payerUserId: z.uuid().optional(),
  owedUserId: z.uuid().optional(),
})
