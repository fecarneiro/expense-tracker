import type { SharedExpense } from '../shared-expenses/shared-expense.types.js'

export type Settlement = {
  id: string
  partnershipId: string
  fromUserId: string
  toUserId: string
  totalAmountCents: number
  createdAt: Date
}

export type PendingBalance = {
  partnershipId: string
  partnerId: string
  userTotals: number
  partnerTotals: number
  totalAmountCents: number
  pendingExpenses: SharedExpense[]
}
