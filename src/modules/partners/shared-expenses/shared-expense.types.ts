export type SharedExpense = {
  id: string
  partnershipId: string
  payerUserId: string
  owedUserId: string
  totalAmountCents: number
  owedAmountCents: number
  sharedCategoryId: string
  settlementId: string | null
  description: string | null
  createdAt: Date
}

export const SPLIT_TYPE = {
  HALF: 'half',
  FULL: 'full',
} as const

export type SplitType = (typeof SPLIT_TYPE)[keyof typeof SPLIT_TYPE]
