import * as z from 'zod'
import type { Category } from './category.types.js'

const categoryBaseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string().trim().min(1).max(255),
  createdAt: z.date(),
})

// params (findById, update, delete)
export const categoryParamsSchema = categoryBaseSchema.pick({ id: true })

// bodies
export const createCategorySchema = categoryBaseSchema.pick({
  name: true,
})

export const updateCategorySchema = categoryBaseSchema.pick({
  name: true,
})

// response mapper
const categoryResponseSchema = categoryBaseSchema.omit({ userId: true })
type CategoryResponse = z.infer<typeof categoryResponseSchema>

export const toCategoryResponse = (c: Category): CategoryResponse => ({
  id: c.id,
  name: c.name,
  createdAt: c.createdAt,
})
