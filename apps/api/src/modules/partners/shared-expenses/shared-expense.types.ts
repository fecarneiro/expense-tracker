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
