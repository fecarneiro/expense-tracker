import * as z from 'zod'

export const transactionIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const transactionAmountInCentsField = z.number().int().positive().meta({
  description: 'Amount in cents.',
  example: 10000,
})

export const transactionTypeField = z.enum(['income', 'expense']).meta({
  example: 'expense',
})

export const transactionNotesField = z
  .string()
  .trim()
  .max(70)
  .optional()
  .transform((val) => (val == null || val === '' ? null : val))
