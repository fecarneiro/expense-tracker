import * as z from 'zod'

const categoryBaseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string().trim().min(1).max(50),
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
