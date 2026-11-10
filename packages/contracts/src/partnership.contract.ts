import { z } from 'zod'

export const partnershipResponseSchema = z
  .object({
    partnerId: z.uuid(),
  })
  .nullable()

export type PartnershipResponse = z.infer<typeof partnershipResponseSchema>
