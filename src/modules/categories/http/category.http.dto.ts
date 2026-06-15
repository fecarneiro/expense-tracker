import * as z from 'zod'

export const categoryNameField = z.string().trim().min(1).max(50)

export const categoryIdParamsSchema = z.strictObject({
  id: z.uuid(),
})

export const createCategoryBodySchema = z.strictObject({
  name: categoryNameField,
})

export const updateCategoryBodySchema = z.strictObject({
  name: categoryNameField,
})

export const categoryHttpResponseSchema = z.object({
  id: z.uuid(),
  name: categoryNameField,
})

export const categoriesHttpResponseSchema = z.array(categoryHttpResponseSchema)

export type CategoryHttpResponse = z.infer<typeof categoryHttpResponseSchema>
