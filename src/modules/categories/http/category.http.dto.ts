import * as z from 'zod'

export const categoryTypeField = z.enum(['income', 'expense']).meta({
  example: 'expense',
})

export const categoryNameField = z.string().trim().min(1).max(50).meta({
  example: 'Food',
})

export const categoryIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const categoryTypeQuerySchema = z
  .strictObject({
    categoryType: categoryTypeField.optional(),
  })
  .meta({
    id: 'CategoryTypeQuery',
  })

export const categoryIdParamsSchema = z.strictObject({
  id: categoryIdField,
})

export const createCategoryBodySchema = z
  .strictObject({
    name: categoryNameField,
    categoryType: categoryTypeField,
  })
  .meta({
    id: 'CreateCategoryBody',
  })

export const updateCategoryBodySchema = z
  .strictObject({
    name: categoryNameField,
    categoryType: categoryTypeField,
  })
  .meta({
    id: 'UpdateCategoryBody',
  })

export const categoryHttpResponseSchema = z
  .object({
    id: categoryIdField,
    name: categoryNameField,
    categoryType: categoryTypeField,
  })
  .meta({
    id: 'Category',
  })

export const categoriesHttpResponseSchema = z.array(categoryHttpResponseSchema).meta({
  id: 'CategoryList',
})
