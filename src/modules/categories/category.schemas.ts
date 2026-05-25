import * as z from 'zod'
import type { Category } from './category.entity.js'

const categoryNameField = z.string().trim().min(1).max(50)

// HTTP schemas
export const categoryIdParamsSchema = z.object({ id: z.uuid() })

export const createCategorySchema = z.object({
  name: categoryNameField,
})

export const updateCategorySchema = z.object({
  name: categoryNameField,
})

// Application inputs
export type CreateCategoryInput = z.infer<typeof createCategorySchema> &
  Pick<Category, 'userId'>

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema> &
  Pick<Category, 'id' | 'userId'>

export type FindCategoryByIdInput = Pick<Category, 'id' | 'userId'>

export type FindAllCategoriesInput = Pick<Category, 'userId'>

export type DeleteCategoryInput = Pick<Category, 'id' | 'userId'>
