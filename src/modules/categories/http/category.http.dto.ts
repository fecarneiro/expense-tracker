import * as z from 'zod'

export const categoryNameField = z.string().trim().min(1).max(50).meta({
  description: 'Category name',
  example: 'Food',
})

export const categoryIdParamsSchema = z.strictObject({
  id: z.uuid().meta({
    description: 'Category unique identifier',
    example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
  }),
})

export const createCategoryBodySchema = z
  .strictObject({
    name: categoryNameField,
  })
  .meta({
    id: 'CreateCategoryBody',
    description: 'Payload for creating a category',
  })

export const updateCategoryBodySchema = z
  .strictObject({
    name: categoryNameField,
  })
  .meta({
    id: 'UpdateCategoryBody',
    description: 'Payload for updating a category',
  })

export const categoryHttpResponseSchema = z
  .object({
    id: z.uuid().meta({
      description: 'Category unique identifier',
      example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
    }),
    name: categoryNameField,
  })
  .meta({
    id: 'Category',
    description: 'Category returned by the API',
  })

export const categoriesHttpResponseSchema = z.array(categoryHttpResponseSchema).meta({
  id: 'CategoryList',
  description: 'List of categories returned by the API',
})

export type CategoryHttpResponse = z.infer<typeof categoryHttpResponseSchema>
