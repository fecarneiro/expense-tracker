import * as z from 'zod'

const cateogryBaseSchema = z.object({
  description: z.string().min(1).max(255),
})

export const createCategorySchema = cateogryBaseSchema

export const cateogoryResponseSchema = cateogryBaseSchema.extend({
  id: z.uuid(),
  userId: z.uuid(),
  createdAt: z.date(),
})

export const updateCategorySchema = cateogryBaseSchema.partial()

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>
export type CategoryDTO = z.infer<typeof cateogoryResponseSchema>
