import { z } from 'zod'

export const pendingBalanceSchema = z.object({
  partnershipId: z.uuid(),
  partnerId: z.uuid(),
  userTotals: z.number().int(),
  partnerTotals: z.number().int(),
  totalAmountCents: z.number().int(),
})

export type PendingBalance = z.infer<typeof pendingBalanceSchema>
