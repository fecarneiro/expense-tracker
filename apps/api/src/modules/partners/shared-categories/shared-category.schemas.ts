import { z } from 'zod'

export const mapUserCategoryToSharedBodySchema = z.object({
  userCategoryId: z.uuid(),
  sharedCategoryId: z.uuid(),
})
