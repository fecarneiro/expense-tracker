import { z } from 'zod'

const sharedExpenseAmountMessageSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^[+-]/, '').replace(',', '.'))
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value))
  .transform((value) => Math.round(Number(value) * 100))
  .pipe(z.number().int().positive())

export type SharedExpenseAmountCents = z.infer<typeof sharedExpenseAmountMessageSchema>

export function sharedExpenseAmountParser(message: string): SharedExpenseAmountCents | null {
  const result = sharedExpenseAmountMessageSchema.safeParse(message)
  return result.success ? result.data : null
}
