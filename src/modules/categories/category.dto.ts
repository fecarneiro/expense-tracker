import * as z from 'zod'
import type { Category } from '../../database/schemas/category.schema.js'

export const categoryNameField = z.string().trim().min(1).max(50)

// HTTP schemas
export const categoryIdParamsSchema = z.object({ id: z.uuid() })

export const createCategorySchema = z.object({
  name: categoryNameField,
})

export const findCategoryByNameInput = z.object({
  name: categoryNameField,
})

export const updateCategorySchema = z.object({
  name: categoryNameField,
})

// Application inputs
export type CreateCategoryInput = z.infer<typeof createCategorySchema> & Pick<Category, 'userId'>

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema> &
  Pick<Category, 'id' | 'userId'>

export type FindCategoryByIdInput = Pick<Category, 'id' | 'userId'>

export type FindCategoryByNameData = z.infer<typeof findCategoryByNameInput> &
  Pick<Category, 'userId'>

export type FindAllCategoriesInput = Pick<Category, 'userId'>

export type DeleteCategoryInput = Pick<Category, 'id' | 'userId'>
