import { z } from 'zod'

export const categoryTypeSchema = z.enum(['income', 'expense'])

export const categoryNameSchema = z.string().trim().min(1).max(50)

export const categoryIdSchema = z.uuid()

export type CategoryType = z.infer<typeof categoryTypeSchema>
