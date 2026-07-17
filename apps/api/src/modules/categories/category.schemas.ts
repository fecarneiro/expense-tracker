import { z } from 'zod'

export const categoryTypeField = z.enum(['income', 'expense'])

export const categoryNameField = z.string().trim().min(1).max(50)

export const categoryIdField = z.uuid()

export const categoryTypeQuerySchema = z.strictObject({
  categoryType: categoryTypeField.optional(),
})

export const categoryIdParamsSchema = z.strictObject({
  id: categoryIdField,
})

export const createCategoryBodySchema = z.strictObject({
  name: categoryNameField,
  categoryType: categoryTypeField,
})

export const updateCategoryBodySchema = z.strictObject({
  name: categoryNameField,
  categoryType: categoryTypeField,
})

export const categoryResponseSchema = z.object({
  id: categoryIdField,
  name: categoryNameField,
  categoryType: categoryTypeField,
})

export const categoriesResponseSchema = z.array(categoryResponseSchema)

export type CreateCategoryBodyInput = z.input<typeof createCategoryBodySchema>
export type UpdateCategoryBodyInput = z.input<typeof updateCategoryBodySchema>
export type CategoryTypeQueryInput = z.input<typeof categoryTypeQuerySchema>
