import type { z } from 'zod'
import { type categoriesResponseSchema, categoryResponseSchema } from './category.schemas.js'
import type { Category } from './category.types.js'

export type CategoryResponse = z.infer<typeof categoryResponseSchema>
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>

export function toCategoryResponse(category: Category): CategoryResponse {
  const { id, name, categoryType } = category
  return categoryResponseSchema.parse({ id, name, categoryType })
}

export function toCategoriesResponse(categories: Category[]): CategoriesResponse {
  return categories.map(toCategoryResponse)
}
