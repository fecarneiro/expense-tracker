import { z } from 'zod'

export const sharedCategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export const sharedCategoriesResponseSchema = z.array(sharedCategorySchema)

export type SharedCategory = z.infer<typeof sharedCategorySchema>
