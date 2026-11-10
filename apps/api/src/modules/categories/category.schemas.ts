import {
  categoryIdSchema,
  categoryNameSchema,
  categoryTypeSchema,
} from '@expense-tracker/contracts'
import { z } from 'zod'

export const categoryTypeQuerySchema = z.strictObject({
  categoryType: categoryTypeSchema.optional(),
})

export const categoryIdParamsSchema = z.strictObject({
  id: categoryIdSchema,
})

export const createCategoryBodySchema = z.strictObject({
  name: categoryNameSchema,
  categoryType: categoryTypeSchema,
})

export const updateCategoryBodySchema = z.strictObject({
  name: categoryNameSchema,
  categoryType: categoryTypeSchema,
})

export const categoryResponseSchema = z.object({
  id: categoryIdSchema,
  name: categoryNameSchema,
  categoryType: categoryTypeSchema,
})

export const categoriesResponseSchema = z.array(categoryResponseSchema)

export type CreateCategoryBodyInput = z.input<typeof createCategoryBodySchema>
export type UpdateCategoryBodyInput = z.input<typeof updateCategoryBodySchema>
export type CategoryTypeQueryInput = z.input<typeof categoryTypeQuerySchema>
